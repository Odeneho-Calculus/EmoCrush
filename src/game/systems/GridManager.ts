import { GameConfig, GameGrid, EmojiCell, GridPosition, EmojiType } from '@/types/game'
import { createInitialGrid, findMatches, swapCells, applyGravity } from '@/utils/gameUtils'

export default class GridManager {
    private config: GameConfig
    private currentGrid: GameGrid

    constructor(config: GameConfig) {
        this.config = config
        this.currentGrid = createInitialGrid(config.gridWidth, config.gridHeight)
    }

    public getCurrentGrid(): GameGrid {
        return this.currentGrid
    }

    public updateGrid(newGrid: GameGrid): void {
        this.currentGrid = newGrid
    }

    public getCellAt(position: GridPosition): EmojiCell | null {
        if (this.isValidPosition(position)) {
            return this.currentGrid.cells[position.row][position.col]
        }
        return null
    }

    public setCellAt(position: GridPosition, cell: EmojiCell): boolean {
        if (this.isValidPosition(position)) {
            this.currentGrid.cells[position.row][position.col] = cell
            return true
        }
        return false
    }

    public swapCells(pos1: GridPosition, pos2: GridPosition): boolean {
        if (this.isValidPosition(pos1) && this.isValidPosition(pos2)) {
            this.currentGrid = swapCells(this.currentGrid, pos1, pos2)
            return true
        }
        return false
    }

    public applyGravity(): GameGrid {
        this.currentGrid = applyGravity(this.currentGrid)
        return this.currentGrid
    }

    public findMatches(): any[] {
        return findMatches(this.currentGrid)
    }

    public isValidPosition(position: GridPosition): boolean {
        return (
            position.row >= 0 &&
            position.row < this.config.gridHeight &&
            position.col >= 0 &&
            position.col < this.config.gridWidth
        )
    }

    public getAdjacentPositions(position: GridPosition): GridPosition[] {
        const adjacent: GridPosition[] = []
        const directions = [
            { row: -1, col: 0 }, // Up
            { row: 1, col: 0 },  // Down
            { row: 0, col: -1 }, // Left
            { row: 0, col: 1 }   // Right
        ]

        directions.forEach(dir => {
            const newPos = {
                row: position.row + dir.row,
                col: position.col + dir.col
            }

            if (this.isValidPosition(newPos)) {
                adjacent.push(newPos)
            }
        })

        return adjacent
    }

    public getRandomEmojiType(): EmojiType {
        const types = this.config.emojiTypes
        return types[Math.floor(Math.random() * types.length)]
    }

    public createNewCell(position: GridPosition, type?: EmojiType): EmojiCell {
        return {
            id: `emoji_${position.row}_${position.col}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: type || this.getRandomEmojiType(),
            position: { ...position },
            isMatched: false,
            isSpecial: false,
            animationState: 'idle'
        }
    }

    public resetGrid(): void {
        this.currentGrid = createInitialGrid(this.config.gridWidth, this.config.gridHeight)
    }

    public getGridDimensions(): { width: number; height: number } {
        return {
            width: this.config.gridWidth,
            height: this.config.gridHeight
        }
    }

    public getAllCells(): EmojiCell[] {
        const cells: EmojiCell[] = []

        for (let row = 0; row < this.config.gridHeight; row++) {
            for (let col = 0; col < this.config.gridWidth; col++) {
                cells.push(this.currentGrid.cells[row][col])
            }
        }

        return cells
    }

    public getCellsInArea(topLeft: GridPosition, bottomRight: GridPosition): EmojiCell[] {
        const cells: EmojiCell[] = []

        for (let row = topLeft.row; row <= bottomRight.row; row++) {
            for (let col = topLeft.col; col <= bottomRight.col; col++) {
                const pos = { row, col }
                if (this.isValidPosition(pos)) {
                    cells.push(this.currentGrid.cells[row][col])
                }
            }
        }

        return cells
    }

    public getColumn(colIndex: number): EmojiCell[] {
        if (colIndex < 0 || colIndex >= this.config.gridWidth) {
            return []
        }

        const column: EmojiCell[] = []
        for (let row = 0; row < this.config.gridHeight; row++) {
            column.push(this.currentGrid.cells[row][colIndex])
        }

        return column
    }

    public getRow(rowIndex: number): EmojiCell[] {
        if (rowIndex < 0 || rowIndex >= this.config.gridHeight) {
            return []
        }

        return [...this.currentGrid.cells[rowIndex]]
    }
}