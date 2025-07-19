import Phaser from 'phaser'
import { EmojiType, GridPosition } from '@/types/game'

export default class EmojiSprite extends Phaser.GameObjects.Sprite {
    private emojiType: EmojiType
    private gridPosition: GridPosition
    private isSelected = false
    private originalScale: number
    private selectionTween?: Phaser.Tweens.Tween

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        emojiType: EmojiType,
        gridPosition: GridPosition
    ) {
        super(scene, x, y, `emoji_${emojiType}`)

        this.emojiType = emojiType
        this.gridPosition = gridPosition
        this.originalScale = 1

        this.setupSprite()
    }

    private setupSprite(): void {
        this.setOrigin(0.5, 0.5)
        this.setInteractive()

        // Add hover effects
        this.on('pointerover', this.onPointerOver, this)
        this.on('pointerout', this.onPointerOut, this)

        // Add subtle idle animation
        this.scene.tweens.add({
            targets: this,
            scaleX: this.originalScale * 1.02,
            scaleY: this.originalScale * 1.02,
            duration: 2000 + Math.random() * 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        })
    }

    private onPointerOver(): void {
        if (!this.isSelected) {
            this.scene.tweens.add({
                targets: this,
                scaleX: this.originalScale * 1.15,
                scaleY: this.originalScale * 1.15,
                duration: 200,
                ease: 'Back.easeOut'
            })

            // Add subtle glow effect on hover
            this.setTint(0xffffcc)
        }
    }

    private onPointerOut(): void {
        if (!this.isSelected) {
            this.scene.tweens.add({
                targets: this,
                scaleX: this.originalScale,
                scaleY: this.originalScale,
                duration: 200,
                ease: 'Back.easeOut'
            })

            this.clearTint()
        }
    }

    public setSelected(selected: boolean): void {
        this.isSelected = selected

        if (this.selectionTween) {
            this.selectionTween.destroy()
        }

        if (selected) {
            // Create pulsing selection effect
            this.selectionTween = this.scene.tweens.add({
                targets: this,
                scaleX: this.originalScale * 1.2,
                scaleY: this.originalScale * 1.2,
                duration: 300,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            })

            // Add glow effect
            this.setTint(0xffff00)
        } else {
            // Return to normal
            this.scene.tweens.add({
                targets: this,
                scaleX: this.originalScale,
                scaleY: this.originalScale,
                duration: 200,
                ease: 'Back.easeOut'
            })

            this.clearTint()
        }
    }

    public getEmojiType(): EmojiType {
        return this.emojiType
    }

    public setEmojiType(emojiType: EmojiType): void {
        this.emojiType = emojiType

        const textureKey = `emoji_${emojiType}`

        // Check if texture exists before setting
        if (this.scene && this.scene.textures && this.scene.textures.exists(textureKey)) {
            this.setTexture(textureKey)
        } else {
            console.warn(`Texture ${textureKey} not found, keeping current texture`)
        }
    }

    public getGridPosition(): GridPosition {
        return { ...this.gridPosition }
    }

    public updateGridPosition(newPosition: GridPosition): void {
        this.gridPosition = newPosition
    }

    public getSelected(): boolean {
        return this.isSelected
    }

    public setGridPosition(position: GridPosition): void {
        this.gridPosition = { ...position }
    }

    public animateMatch(): Promise<void> {
        return new Promise((resolve) => {
            // Create explosion effect
            this.scene.tweens.add({
                targets: this,
                scaleX: this.originalScale * 1.5,
                scaleY: this.originalScale * 1.5,
                alpha: 0,
                rotation: Math.PI * 2,
                duration: 300,
                ease: 'Back.easeIn',
                onComplete: () => {
                    this.setVisible(false)
                    resolve()
                }
            })
        })
    }

    public animateFall(targetY: number): Promise<void> {
        return new Promise((resolve) => {
            this.scene.tweens.add({
                targets: this,
                y: targetY,
                duration: 400,
                ease: 'Bounce.easeOut',
                onComplete: () => resolve()
            })
        })
    }

    public animateSpawn(): Promise<void> {
        return new Promise((resolve) => {
            // Start invisible and small
            this.setAlpha(0)
            this.setScale(0)
            this.setVisible(true)

            // Animate in
            this.scene.tweens.add({
                targets: this,
                alpha: 1,
                scaleX: this.originalScale,
                scaleY: this.originalScale,
                duration: 400,
                ease: 'Back.easeOut',
                onComplete: () => resolve()
            })
        })
    }

    public animateSwap(targetX: number, targetY: number): Promise<void> {
        return new Promise((resolve) => {
            this.scene.tweens.add({
                targets: this,
                x: targetX,
                y: targetY,
                duration: 250,
                ease: 'Power2.easeInOut',
                onComplete: () => resolve()
            })
        })
    }

    public shake(): Promise<void> {
        return new Promise((resolve) => {
            const originalX = this.x

            this.scene.tweens.add({
                targets: this,
                x: originalX + 10,
                duration: 50,
                yoyo: true,
                repeat: 3,
                ease: 'Power2.easeInOut',
                onComplete: () => {
                    this.x = originalX
                    resolve()
                }
            })
        })
    }

    public pulse(color: number = 0xffffff): Promise<void> {
        return new Promise((resolve) => {
            this.setTint(color)

            this.scene.tweens.add({
                targets: this,
                scaleX: this.originalScale * 1.3,
                scaleY: this.originalScale * 1.3,
                duration: 200,
                yoyo: true,
                ease: 'Power2.easeInOut',
                onComplete: () => {
                    this.clearTint()
                    resolve()
                }
            })
        })
    }

    public setOriginalScale(scale: number): void {
        this.originalScale = scale
        this.setScale(scale)
    }

    public destroy(fromScene?: boolean): void {
        if (this.selectionTween) {
            this.selectionTween.destroy()
        }

        super.destroy(fromScene)
    }
}