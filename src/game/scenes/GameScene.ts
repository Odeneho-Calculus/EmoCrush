import Phaser from 'phaser'
import { Store } from '@reduxjs/toolkit'
import { RootState } from '@/store/store'
import {
    updateGrid,
    selectCell,
    setProcessing,
    processMatches,
    useMove,
    endGame
} from '@/store/slices/gameSlice'
import { addNotification } from '@/store/slices/uiSlice'
import {
    GameConfig,
    EmojiCell,
    GridPosition
} from '@/types/game'
import {
    findMatches,
    swapCells,
    applyGravity,
    removeMatches,
    isValidMove,
    findPossibleMoves
} from '@/utils/gameUtils'
import EmojiSprite from '../objects/EmojiSprite'
import AnimationSystem from '../systems/AnimationSystem'

interface SwipeData {
    startX: number
    startY: number
    sprite: EmojiSprite
    threshold: number
}

interface DragData {
    isDragging: boolean
    dragSprite: EmojiSprite | null
    startPosition: { x: number, y: number }
    dragThreshold: number
}

export default class GameScene extends Phaser.Scene {
    private reduxStore!: Store<RootState>
    private gameConfig!: GameConfig
    private animationSystem!: AnimationSystem

    private emojiSprites: EmojiSprite[][] = []
    private selectedSprite: EmojiSprite | null = null
    private isProcessingMove = false
    private gridStartX = 0
    private gridStartY = 0
    private cellSize = 64
    private gridBackground!: Phaser.GameObjects.Graphics

    // Multi-platform input support
    private swipeData: SwipeData | null = null
    private dragData: DragData = {
        isDragging: false,
        dragSprite: null,
        startPosition: { x: 0, y: 0 },
        dragThreshold: 20
    }
    private isTouchDevice = false

    // Keyboard navigation
    private keyboardSelectedRow = 0
    private keyboardSelectedCol = 0
    private keyboardIndicator?: Phaser.GameObjects.Graphics

    // Hint system
    private hintTimer?: Phaser.Time.TimerEvent
    private hintSprites: EmojiSprite[] = []
    private hintTween?: Phaser.Tweens.Tween
    private hintDelay = 8000 // 8 seconds before showing hint

    // UI safe areas
    private safeAreaTop = 80
    private safeAreaBottom = 100

    constructor() {
        super({ key: 'GameScene' })
    }

    init(): void {
        this.reduxStore = this.registry.get('reduxStore')
        this.gameConfig = this.registry.get('gameConfig')
    }

    preload(): void {
        this.createEmojiTextures()
        this.load.image('particle', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==')
    }

    create(): void {
        // Detect input type
        this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0

        this.setupSystems()
        this.setupGrid()
        this.setupInput()
        this.createInitialBoard()
        this.setupKeyboardNavigation()
        this.startHintTimer()

        // Listen to Redux state changes
        this.reduxStore.subscribe(() => {
            this.handleStateChange()
        })

        // Show input method hint
        this.showInputMethodHint()
    }

    private createEmojiTextures(): void {
        const canvas = document.createElement('canvas')
        canvas.width = 64
        canvas.height = 64
        const ctx = canvas.getContext('2d')!

        this.gameConfig.emojiTypes.forEach(emoji => {
            ctx.clearRect(0, 0, 64, 64)
            ctx.font = '48px Arial'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(emoji, 32, 32)

            this.textures.addCanvas(`emoji_${emoji}`, canvas)
        })
    }

    private setupSystems(): void {
        this.animationSystem = new AnimationSystem(this, this.gameConfig)
    }

    private setupGrid(): void {
        const gameWidth = this.scale.width
        const gameHeight = this.scale.height

        // Calculate optimal cell size considering safe areas
        const availableWidth = gameWidth - 40 // side margins
        const availableHeight = gameHeight - this.safeAreaTop - this.safeAreaBottom

        this.cellSize = Math.min(
            availableWidth / this.gameConfig.gridWidth,
            availableHeight / this.gameConfig.gridHeight
        )

        // Ensure minimum cell size for touch interaction
        this.cellSize = Math.max(this.cellSize, 50)

        const gridWidth = this.gameConfig.gridWidth * this.cellSize
        const gridHeight = this.gameConfig.gridHeight * this.cellSize

        this.gridStartX = (gameWidth - gridWidth) / 2
        this.gridStartY = this.safeAreaTop + (availableHeight - gridHeight) / 2

        // Create grid background with improved visual design
        this.gridBackground = this.add.graphics()
        this.drawGridBackground()
    }

    private drawGridBackground(): void {
        this.gridBackground.clear()

        // Main background with gradient effect
        this.gridBackground.fillStyle(0xffffff, 0.95)
        this.gridBackground.fillRoundedRect(
            this.gridStartX - 15,
            this.gridStartY - 15,
            this.gameConfig.gridWidth * this.cellSize + 30,
            this.gameConfig.gridHeight * this.cellSize + 30,
            15
        )

        // Add subtle shadow effect
        this.gridBackground.fillStyle(0x000000, 0.1)
        this.gridBackground.fillRoundedRect(
            this.gridStartX - 12,
            this.gridStartY - 12,
            this.gameConfig.gridWidth * this.cellSize + 24,
            this.gameConfig.gridHeight * this.cellSize + 24,
            12
        )

        // Draw enhanced grid lines
        this.gridBackground.lineStyle(1, 0xd0d0d0, 0.6)

        for (let row = 0; row <= this.gameConfig.gridHeight; row++) {
            const y = this.gridStartY + row * this.cellSize
            this.gridBackground.lineBetween(
                this.gridStartX,
                y,
                this.gridStartX + this.gameConfig.gridWidth * this.cellSize,
                y
            )
        }

        for (let col = 0; col <= this.gameConfig.gridWidth; col++) {
            const x = this.gridStartX + col * this.cellSize
            this.gridBackground.lineBetween(
                x,
                this.gridStartY,
                x,
                this.gridStartY + this.gameConfig.gridHeight * this.cellSize
            )
        }
    }

    private setupInput(): void {
        // Multi-platform input handling
        if (this.isTouchDevice) {
            // Touch device optimized input
            this.input.on('gameobjectdown', this.handleTouchStart, this)
            this.input.on('gameobjectup', this.handleTouchEnd, this)
            this.input.on('pointermove', this.handleTouchMove, this)
            this.input.on('pointerup', this.handleTouchUp, this)
        } else {
            // Desktop optimized input
            this.input.on('gameobjectdown', this.handleMouseDown, this)
            this.input.on('gameobjectup', this.handleMouseUp, this)
            this.input.on('pointermove', this.handleMouseMove, this)
            this.input.on('pointerup', this.handleMouseUpGlobal, this)
            this.input.on('gameobjectover', this.handleMouseOver, this)
            this.input.on('gameobjectout', this.handleMouseOut, this)
        }

        // Global pointer events for drag completion
        this.input.on('pointerupoutside', this.handlePointerUpOutside, this)
    }

    private setupKeyboardNavigation(): void {
        if (!this.isTouchDevice) {
            // Create keyboard indicator
            this.keyboardIndicator = this.add.graphics()
            this.updateKeyboardIndicator()

            // Setup keyboard controls
            this.input.keyboard!.on('keydown-UP', this.handleKeyUp, this)
            this.input.keyboard!.on('keydown-DOWN', this.handleKeyDown, this)
            this.input.keyboard!.on('keydown-LEFT', this.handleKeyLeft, this)
            this.input.keyboard!.on('keydown-RIGHT', this.handleKeyRight, this)
            this.input.keyboard!.on('keydown-ENTER', this.handleKeyEnter, this)
            this.input.keyboard!.on('keydown-SPACE', this.handleKeySpace, this)
            this.input.keyboard!.on('keydown-ESC', this.handleKeyEsc, this)
            this.input.keyboard!.on('keydown-H', this.handleKeyHint, this)

            // WASD support
            this.input.keyboard!.on('keydown-W', this.handleKeyUp, this)
            this.input.keyboard!.on('keydown-S', this.handleKeyDown, this)
            this.input.keyboard!.on('keydown-A', this.handleKeyLeft, this)
            this.input.keyboard!.on('keydown-D', this.handleKeyRight, this)
        }
    }

    // Touch Input Handlers (Mobile)
    private handleTouchStart(pointer: Phaser.Input.Pointer, gameObject: EmojiSprite): void {
        if (this.isProcessingMove) return

        const sprite = gameObject as EmojiSprite
        this.swipeData = {
            startX: pointer.x,
            startY: pointer.y,
            sprite: sprite,
            threshold: this.cellSize * 0.3 // 30% of cell size for swipe sensitivity
        }

        this.clearHints()
        this.resetHintTimer()
    }

    private handleTouchMove(pointer: Phaser.Input.Pointer): void {
        if (!this.swipeData || this.isProcessingMove) return

        const deltaX = pointer.x - this.swipeData.startX
        const deltaY = pointer.y - this.swipeData.startY
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

        if (distance > this.swipeData.threshold) {
            this.handleSwipeGesture(deltaX, deltaY)
            this.swipeData = null
        }
    }

    private handleTouchEnd(pointer: Phaser.Input.Pointer, gameObject: EmojiSprite): void {
        if (this.isProcessingMove) return

        // If no swipe detected, handle as tap
        if (this.swipeData) {
            this.handleEmojiClick(gameObject)
            this.swipeData = null
        }
    }

    private handleTouchUp(): void {
        this.swipeData = null
    }

    // Mouse Input Handlers (Desktop)
    private handleMouseDown(pointer: Phaser.Input.Pointer, gameObject: EmojiSprite): void {
        if (this.isProcessingMove) return

        const sprite = gameObject as EmojiSprite

        this.dragData.dragSprite = sprite
        this.dragData.startPosition = { x: pointer.x, y: pointer.y }
        this.dragData.isDragging = false

        this.clearHints()
        this.resetHintTimer()
    }

    private handleMouseMove(pointer: Phaser.Input.Pointer): void {
        if (!this.dragData.dragSprite || this.isProcessingMove) return

        const deltaX = pointer.x - this.dragData.startPosition.x
        const deltaY = pointer.y - this.dragData.startPosition.y
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

        if (distance > this.dragData.dragThreshold && !this.dragData.isDragging) {
            this.dragData.isDragging = true
            this.dragData.dragSprite.setTint(0x00ff00) // Green tint for dragging
            this.dragData.dragSprite.setScale((this.cellSize / 64) * 1.2)
        }
    }

    private handleMouseUp(pointer: Phaser.Input.Pointer, gameObject: EmojiSprite): void {
        if (this.isProcessingMove) return

        if (this.dragData.isDragging && this.dragData.dragSprite) {
            // Handle drop on target sprite
            const targetSprite = gameObject as EmojiSprite
            if (targetSprite !== this.dragData.dragSprite) {
                const startPos = this.dragData.dragSprite.getGridPosition()
                const endPos = targetSprite.getGridPosition()
                this.attemptSwap(startPos, endPos)
            }
            this.resetDragState()
        } else if (this.dragData.dragSprite && !this.dragData.isDragging) {
            // Handle click
            this.handleEmojiClick(this.dragData.dragSprite)
            this.resetDragState()
        }
    }

    private handleMouseUpGlobal(): void {
        if (this.dragData.isDragging) {
            // Drag ended without valid drop
            this.resetDragState()
            this.reduxStore.dispatch(addNotification({
                type: 'info',
                message: 'Drag to an adjacent emoji to swap! 🖱️',
                duration: 2000
            }))
        }
    }

    private handleMouseOver(pointer: Phaser.Input.Pointer, gameObject: EmojiSprite): void {
        const sprite = gameObject as EmojiSprite
        if (this.dragData.isDragging && this.dragData.dragSprite && sprite !== this.dragData.dragSprite) {
            // Show drop target feedback
            sprite.setTint(0xffff00) // Yellow tint for drop target
        }
    }

    private handleMouseOut(pointer: Phaser.Input.Pointer, gameObject: EmojiSprite): void {
        const sprite = gameObject as EmojiSprite
        if (!sprite.getSelected() && sprite !== this.dragData.dragSprite) {
            sprite.clearTint()
        }
    }

    private handlePointerUpOutside(): void {
        this.resetDragState()
        this.swipeData = null
    }

    private resetDragState(): void {
        if (this.dragData.dragSprite) {
            this.dragData.dragSprite.clearTint()
            this.dragData.dragSprite.setScale(this.cellSize / 64)
        }
        this.dragData.isDragging = false
        this.dragData.dragSprite = null

        // Clear any drop target highlights
        this.emojiSprites.forEach(row => {
            row.forEach(sprite => {
                if (!sprite.getSelected()) {
                    sprite.clearTint()
                }
            })
        })
    }

    private handleSwipeGesture(deltaX: number, deltaY: number): void {
        if (!this.swipeData) return

        const sprite = this.swipeData.sprite
        const currentPos = sprite.getGridPosition()

        // Determine swipe direction
        let targetPos: GridPosition | null = null

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Horizontal swipe
            if (deltaX > 0 && currentPos.col < this.gameConfig.gridWidth - 1) {
                targetPos = { row: currentPos.row, col: currentPos.col + 1 }
            } else if (deltaX < 0 && currentPos.col > 0) {
                targetPos = { row: currentPos.row, col: currentPos.col - 1 }
            }
        } else {
            // Vertical swipe
            if (deltaY > 0 && currentPos.row < this.gameConfig.gridHeight - 1) {
                targetPos = { row: currentPos.row + 1, col: currentPos.col }
            } else if (deltaY < 0 && currentPos.row > 0) {
                targetPos = { row: currentPos.row - 1, col: currentPos.col }
            }
        }

        if (targetPos) {
            this.attemptSwap(currentPos, targetPos)
        }
    }

    // Keyboard Navigation Handlers
    private updateKeyboardIndicator(): void {
        if (!this.keyboardIndicator) return

        this.keyboardIndicator.clear()
        this.keyboardIndicator.lineStyle(3, 0xff00ff, 1)

        const x = this.gridStartX + this.keyboardSelectedCol * this.cellSize
        const y = this.gridStartY + this.keyboardSelectedRow * this.cellSize

        this.keyboardIndicator.strokeRect(x, y, this.cellSize, this.cellSize)
    }

    private handleKeyUp(): void {
        if (this.isProcessingMove) return

        this.keyboardSelectedRow = Math.max(0, this.keyboardSelectedRow - 1)
        this.updateKeyboardIndicator()
    }

    private handleKeyDown(): void {
        if (this.isProcessingMove) return

        this.keyboardSelectedRow = Math.min(this.gameConfig.gridHeight - 1, this.keyboardSelectedRow + 1)
        this.updateKeyboardIndicator()
    }

    private handleKeyLeft(): void {
        if (this.isProcessingMove) return

        this.keyboardSelectedCol = Math.max(0, this.keyboardSelectedCol - 1)
        this.updateKeyboardIndicator()
    }

    private handleKeyRight(): void {
        if (this.isProcessingMove) return

        this.keyboardSelectedCol = Math.min(this.gameConfig.gridWidth - 1, this.keyboardSelectedCol + 1)
        this.updateKeyboardIndicator()
    }

    private handleKeyEnter(): void {
        if (this.isProcessingMove) return

        const sprite = this.emojiSprites[this.keyboardSelectedRow][this.keyboardSelectedCol]
        this.handleEmojiClick(sprite)
    }

    private handleKeySpace(): void {
        if (this.isProcessingMove) return

        const sprite = this.emojiSprites[this.keyboardSelectedRow][this.keyboardSelectedCol]
        this.handleEmojiClick(sprite)
    }

    private handleKeyEsc(): void {
        this.deselectSprite()
        this.resetDragState()
        this.clearHints()
    }

    private handleKeyHint(): void {
        this.showHint()
    }

    private showInputMethodHint(): void {
        let message = ''
        let detailMessage = ''

        if (this.isTouchDevice) {
            message = '📱 Touch Controls Ready!'
            detailMessage = 'Swipe to move emojis or tap to select adjacent pairs. Hints auto-appear after 8 seconds of inactivity.'
        } else {
            message = '🖱️ Multiple Input Methods Available!'
            detailMessage = '• Drag & Drop: Click and drag emojis\n• Click Mode: Click two adjacent emojis\n• Keyboard: Arrow keys + Enter/Space\n• Press H for hints, Esc to deselect'
        }

        this.reduxStore.dispatch(addNotification({
            type: 'info',
            message: message,
            duration: 3000
        }))

        // Show detailed controls after the first message
        setTimeout(() => {
            this.reduxStore.dispatch(addNotification({
                type: 'info',
                message: detailMessage,
                duration: 6000
            }))
        }, 3500)
    }

    private handleEmojiClick(gameObject: EmojiSprite): void {
        const clickedSprite = gameObject as EmojiSprite
        const clickedPos = clickedSprite.getGridPosition()

        if (!this.selectedSprite) {
            // First selection
            this.selectSprite(clickedSprite)
        } else if (this.selectedSprite === clickedSprite) {
            // Deselect same sprite
            this.deselectSprite()
        } else {
            // Second selection - attempt swap
            const selectedPos = this.selectedSprite.getGridPosition()
            this.attemptSwap(selectedPos, clickedPos)
        }
    }

    private createInitialBoard(): void {
        const state = this.reduxStore.getState()
        const grid = state.game.grid

        this.emojiSprites = []

        for (let row = 0; row < this.gameConfig.gridHeight; row++) {
            this.emojiSprites[row] = []
            for (let col = 0; col < this.gameConfig.gridWidth; col++) {
                const cell = grid.cells[row][col]
                const sprite = this.createEmojiSprite(cell, row, col)
                this.emojiSprites[row][col] = sprite
            }
        }
    }

    private createEmojiSprite(cell: EmojiCell, row: number, col: number): EmojiSprite {
        const x = this.gridStartX + col * this.cellSize + this.cellSize / 2
        const y = this.gridStartY + row * this.cellSize + this.cellSize / 2

        const sprite = new EmojiSprite(this, x, y, cell.type, { row, col })
        sprite.setOriginalScale(this.cellSize / 64)
        sprite.setInteractive()

        this.add.existing(sprite)
        return sprite
    }

    private selectSprite(sprite: EmojiSprite): void {
        this.selectedSprite = sprite
        sprite.setSelected(true)

        const pos = sprite.getGridPosition()
        this.reduxStore.dispatch(selectCell(pos))

        // Update keyboard selection to match clicked sprite
        if (!this.isTouchDevice) {
            this.keyboardSelectedRow = pos.row
            this.keyboardSelectedCol = pos.col
            this.updateKeyboardIndicator()
        }
    }

    private deselectSprite(): void {
        if (this.selectedSprite) {
            this.selectedSprite.setSelected(false)
            this.selectedSprite = null
        }
        this.reduxStore.dispatch(selectCell(null))
    }

    private async attemptSwap(pos1: GridPosition, pos2: GridPosition): Promise<void> {
        const state = this.reduxStore.getState()
        const grid = state.game.grid

        if (!isValidMove(grid, pos1, pos2)) {
            // Enhanced invalid move feedback
            await this.showInvalidMoveFeedback(pos1, pos2)
            this.deselectSprite()
            return
        }

        this.isProcessingMove = true
        this.reduxStore.dispatch(setProcessing(true))
        this.deselectSprite()
        this.clearHints()

        // Perform the swap animation
        await this.animationSystem.swapSprites(
            this.emojiSprites[pos1.row][pos1.col],
            this.emojiSprites[pos2.row][pos2.col]
        )

        // Update the grid state
        const newGrid = swapCells(grid, pos1, pos2)
        this.reduxStore.dispatch(updateGrid(newGrid.cells))

        // Swap sprites in our local array
        const tempSprite = this.emojiSprites[pos1.row][pos1.col]
        this.emojiSprites[pos1.row][pos1.col] = this.emojiSprites[pos2.row][pos2.col]
        this.emojiSprites[pos2.row][pos2.col] = tempSprite

        // Update sprite positions
        this.emojiSprites[pos1.row][pos1.col].setGridPosition(pos1)
        this.emojiSprites[pos2.row][pos2.col].setGridPosition(pos2)

        // Use a move
        this.reduxStore.dispatch(useMove())

        // Process matches and cascades
        await this.processMatchesAndCascades()

        this.isProcessingMove = false
        this.reduxStore.dispatch(setProcessing(false))

        // Restart hint timer after move
        this.startHintTimer()

        // Check for game over conditions
        this.checkGameOver()
    }

    private async showInvalidMoveFeedback(pos1: GridPosition, pos2: GridPosition): Promise<void> {
        const sprite1 = this.emojiSprites[pos1.row][pos1.col]
        const sprite2 = this.emojiSprites[pos2.row][pos2.col]

        // Shake both sprites
        await Promise.all([
            this.animationSystem.shakeSprite(sprite1),
            this.animationSystem.shakeSprite(sprite2)
        ])

        // Show warning notification
        this.reduxStore.dispatch(addNotification({
            type: 'warning',
            message: 'No matches possible! Try a different move. 🤔',
            duration: 2000
        }))
    }

    // Hint System Implementation
    private startHintTimer(): void {
        this.clearHintTimer()

        this.hintTimer = this.time.delayedCall(this.hintDelay, () => {
            this.showHint()
        })
    }

    private resetHintTimer(): void {
        this.clearHints()
        this.startHintTimer()
    }

    private clearHintTimer(): void {
        if (this.hintTimer) {
            this.hintTimer.remove()
            this.hintTimer = undefined
        }
    }

    private showHint(): void {
        if (this.isProcessingMove) {
            this.startHintTimer()
            return
        }

        const state = this.reduxStore.getState()
        const grid = state.game.grid
        const possibleMoves = findPossibleMoves(grid)

        if (possibleMoves.length > 0) {
            // Show hint for the first possible move
            const hintMove = possibleMoves[0]
            this.hintSprites = hintMove.map(pos => this.emojiSprites[pos.row][pos.col])

            this.animateHint()

            // Show helpful notification
            this.reduxStore.dispatch(addNotification({
                type: 'info',
                message: '💡 Hint: Try swapping these highlighted emojis!',
                duration: 4000
            }))
        }

        // Restart timer for continuous hints
        this.startHintTimer()
    }

    private animateHint(): void {
        if (this.hintSprites.length === 0) return

        this.hintTween = this.tweens.add({
            targets: this.hintSprites,
            alpha: 0.3,
            scale: (this.cellSize / 64) * 1.3,
            duration: 800,
            yoyo: true,
            repeat: 2,
            ease: 'Sine.easeInOut',
            onComplete: () => {
                this.clearHints()
            }
        })
    }

    private clearHints(): void {
        if (this.hintTween) {
            this.hintTween.stop()
            this.hintTween = undefined
        }

        this.hintSprites.forEach(sprite => {
            sprite.alpha = 1
            sprite.setScale(this.cellSize / 64)
        })
        this.hintSprites = []
    }

    private async processMatchesAndCascades(): Promise<void> {
        let cascadeCount = 0
        let hasMatches = true
        const maxCascades = 10 // Prevent infinite loops

        this.reduxStore.dispatch(addNotification({
            type: 'info',
            message: '💥 Processing matches...',
            duration: 1000
        }))

        while (hasMatches && cascadeCount < maxCascades) {
            const state = this.reduxStore.getState()
            const grid = state.game.grid
            const matches = findMatches(grid)

            if (matches.length === 0) {
                hasMatches = false
                break
            }

            cascadeCount++

            // Show cascade feedback
            if (cascadeCount > 1) {
                this.reduxStore.dispatch(addNotification({
                    type: 'success',
                    message: `💫 ${cascadeCount}x Cascade Chain!`,
                    duration: 1500
                }))
            }

            // Process matches in Redux first
            this.reduxStore.dispatch(processMatches(matches))

            // Step 1: Animate and remove matching emojis
            await this.animateMatchRemoval(matches)

            // Step 2: Apply gravity - let everything fall down
            await this.animateGravityFall(grid)

            // Step 3: Spawn new emojis from the top
            await this.spawnNewEmojis()

            // Step 4: Check for chain reactions after brief pause
            await new Promise(resolve => setTimeout(resolve, 400))
        }

        // Final cascade bonus
        if (cascadeCount > 1) {
            this.reduxStore.dispatch(updateCombo(cascadeCount))
            this.reduxStore.dispatch(addNotification({
                type: 'success',
                message: `🎉 ${cascadeCount}x CASCADE BONUS! +${cascadeCount * 500} points!`,
                duration: 3000
            }))

            // Reset combo after showing bonus
            setTimeout(() => {
                this.reduxStore.dispatch(updateCombo(0))
            }, 3500)
        }

        // Final message
        this.reduxStore.dispatch(addNotification({
            type: 'success',
            message: cascadeCount === 1 ? '✨ Match complete!' : `🔥 Epic ${cascadeCount}x cascade complete!`,
            duration: 2000
        }))
    }

    // Step 1: Animate removal of matched emojis
    private async animateMatchRemoval(matches: any[]): Promise<void> {
        const matchingSprites: EmojiSprite[] = []

        matches.forEach(match => {
            match.cells.forEach(pos => {
                const sprite = this.emojiSprites[pos.row][pos.col]
                if (sprite) {
                    matchingSprites.push(sprite)
                }
            })
        })

        // Animate the destruction
        await this.animationSystem.animateMatches(matchingSprites)

        // Mark sprites for removal (keep in array but make invisible)
        matchingSprites.forEach(sprite => {
            sprite.setVisible(false)
            sprite.setActive(false)
        })
    }

    // Step 2: Apply gravity - make emojis fall down to fill gaps
    private async animateGravityFall(currentGrid: any): Promise<void> {
        // Create mapping of which sprites need to fall and where
        const fallAnimations: Array<{ sprite: EmojiSprite, targetRow: number, distance: number }> = []

        for (let col = 0; col < this.gameConfig.gridWidth; col++) {
            // Find all active sprites in this column from bottom to top
            const activeSprites: Array<{ sprite: EmojiSprite, row: number }> = []

            for (let row = this.gameConfig.gridHeight - 1; row >= 0; row--) {
                const sprite = this.emojiSprites[row][col]

                if (sprite && sprite.visible && sprite.active) {
                    activeSprites.push({ sprite, row })
                }
            }

            // Rearrange sprites to fill from bottom up
            activeSprites.forEach((item, index) => {
                const targetRow = this.gameConfig.gridHeight - 1 - index
                const currentRow = item.row

                if (targetRow !== currentRow) {
                    fallAnimations.push({
                        sprite: item.sprite,
                        targetRow: targetRow,
                        distance: targetRow - currentRow
                    })
                }
            })
        }

        // Execute fall animations
        const fallPromises = fallAnimations.map(({ sprite, targetRow, distance }) => {
            const targetY = this.gridStartY + targetRow * this.cellSize + this.cellSize / 2

            // Move sprite to new grid position in array
            const oldPos = sprite.getGridPosition()
            const newPos = { row: targetRow, col: oldPos.col }

            // Clear old position and set new position
            this.emojiSprites[oldPos.row][oldPos.col] = null as any
            this.emojiSprites[newPos.row][newPos.col] = sprite

            // Update sprite's internal grid position
            sprite.updateGridPosition(newPos)

            return this.animationSystem.animateFall(sprite, targetY)
        })

        if (fallPromises.length > 0) {
            this.reduxStore.dispatch(addNotification({
                type: 'info',
                message: `⬇️ ${fallPromises.length} emojis falling!`,
                duration: 1000
            }))
        }

        await Promise.all(fallPromises)
    }

    // Step 3: Spawn new emojis to fill empty top slots
    private async spawnNewEmojis(): Promise<void> {
        const spawnPromises: Promise<void>[] = []

        // Apply gravity and spawn logic from Redux
        const state = this.reduxStore.getState()
        const gridWithGravity = applyGravity(state.game.grid)
        this.reduxStore.dispatch(updateGrid(gridWithGravity.cells))

        // Create new sprites for spawned emojis
        for (let col = 0; col < this.gameConfig.gridWidth; col++) {
            for (let row = 0; row < this.gameConfig.gridHeight; row++) {
                const cell = gridWithGravity.cells[row][col]
                let sprite = this.emojiSprites[row][col]

                // If sprite doesn't exist or is inactive, create new one
                if (!sprite || !sprite.active || !sprite.visible) {
                    if (sprite) sprite.destroy()

                    sprite = this.createEmojiSprite(cell, row, col)
                    this.emojiSprites[row][col] = sprite

                    // Start sprite above screen for spawn animation
                    sprite.y = this.gridStartY - this.cellSize * 2
                    spawnPromises.push(this.animationSystem.animateSpawn(sprite))
                }
            }
        }

        await Promise.all(spawnPromises)
    }

    private async animateGravityAndSpawn(newGrid: any): Promise<void> {
        const promises: Promise<void>[] = []

        for (let col = 0; col < this.gameConfig.gridWidth; col++) {
            for (let row = this.gameConfig.gridHeight - 1; row >= 0; row--) {
                const cell = newGrid.cells[row][col]
                const sprite = this.emojiSprites[row][col]

                if (cell.animationState === 'falling') {
                    // Animate falling
                    const targetY = this.gridStartY + row * this.cellSize + this.cellSize / 2
                    promises.push(this.animationSystem.animateFall(sprite, targetY))

                    // Update sprite emoji type if changed after fall setup
                    if (sprite.getEmojiType() !== cell.type) {
                        sprite.setEmojiType(cell.type)
                    }
                } else if (cell.animationState === 'spawning') {
                    // Create new sprite for spawned emoji
                    sprite.destroy()
                    const newSprite = this.createEmojiSprite(cell, row, col)
                    this.emojiSprites[row][col] = newSprite

                    // Animate spawn
                    promises.push(this.animationSystem.animateSpawn(newSprite))
                    // New sprite already has correct type from createEmojiSprite
                } else {
                    // For idle or other states, just update type if needed
                    if (sprite.getEmojiType() !== cell.type) {
                        sprite.setEmojiType(cell.type)
                    }
                }
            }
        }

        await Promise.all(promises)
    }

    private checkGameOver(): void {
        const state = this.reduxStore.getState()
        const { moves, maxMoves, objectives } = state.game

        // Check if all objectives are complete
        const allObjectivesComplete = objectives.every(obj => obj.completed)

        if (allObjectivesComplete) {
            this.clearHintTimer()
            this.reduxStore.dispatch(endGame('level_complete'))
            return
        }

        // Check if no moves left
        if (moves >= maxMoves) {
            this.clearHintTimer()
            this.reduxStore.dispatch(endGame('game_over'))
            return
        }

        // Check if no possible moves available
        const grid = state.game.grid
        const possibleMoves = findPossibleMoves(grid)

        if (possibleMoves.length === 0) {
            this.reduxStore.dispatch(addNotification({
                type: 'info',
                message: '🔄 No moves available! Shuffling board...',
                duration: 3000
            }))
            this.clearHintTimer()
            // TODO: Implement board shuffle
        }
    }

    private handleStateChange(): void {
        const state = this.reduxStore.getState()
        const gameStatus = state.game.gameStatus

        if (gameStatus === 'paused') {
            this.scene.pause()
            this.clearHintTimer()
        } else if (gameStatus === 'playing') {
            this.scene.resume()
            this.startHintTimer()
        }
    }

    update(): void {
        // Update systems
        this.animationSystem.update()
    }

    // Cleanup when scene is destroyed
    destroy(): void {
        this.clearHintTimer()
        this.clearHints()
        super.destroy()
    }
}