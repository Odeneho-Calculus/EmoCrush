import { GameConfig, GameGrid, Match, GridPosition, EmojiCell, SpecialEmojiType } from '@/types/game'
import { findMatches, calculateMatchScore } from '@/utils/gameUtils'

export default class MatchSystem {
    private config: GameConfig

    constructor(config: GameConfig) {
        this.config = config
    }

    public findAllMatches(grid: GameGrid): Match[] {
        return findMatches(grid)
    }

    public findMatchesFromPosition(grid: GameGrid, position: GridPosition): Match[] {
        const allMatches = this.findAllMatches(grid)
        return allMatches.filter(match =>
            match.cells.some(cell =>
                cell.row === position.row && cell.col === position.col
            )
        )
    }

    public calculateMatchScore(match: Match): number {
        return calculateMatchScore(match)
    }

    public calculateTotalScore(matches: Match[]): number {
        return matches.reduce((total, match) => total + this.calculateMatchScore(match), 0)
    }

    public determineSpecialEmoji(match: Match): SpecialEmojiType | null {
        const length = match.length

        if (length >= 5) {
            // 5+ match creates rainbow emoji
            return 'rainbow'
        } else if (length === 4) {
            // 4 match creates directional blast
            return match.type === 'horizontal' ? 'vertical_blast' : 'horizontal_blast'
        } else if (this.isLShapeMatch(match) || this.isTShapeMatch(match)) {
            // L or T shape creates bomb
            return 'bomb'
        }

        return null
    }

    public findLShapeMatches(grid: GameGrid): Match[] {
        const lMatches: Match[] = []
        const { cells, width, height } = grid

        // Check for L-shapes at each position
        for (let row = 0; row < height - 2; row++) {
            for (let col = 0; col < width - 2; col++) {
                const centerType = cells[row + 1][col + 1].type

                // Check all possible L-shape orientations
                const lShapes = [
                    // L shape (bottom-left corner)
                    [
                        { row: row, col: col + 1 },
                        { row: row + 1, col: col + 1 },
                        { row: row + 2, col: col + 1 },
                        { row: row + 2, col: col },
                        { row: row + 2, col: col + 2 }
                    ],
                    // Rotated L shapes...
                    // (Add more orientations as needed)
                ]

                lShapes.forEach(shape => {
                    if (this.isValidLShape(cells, shape, centerType)) {
                        lMatches.push({
                            cells: shape,
                            type: 'l_shape',
                            length: shape.length
                        })
                    }
                })
            }
        }

        return lMatches
    }

    public findTShapeMatches(grid: GameGrid): Match[] {
        const tMatches: Match[] = []
        const { cells, width, height } = grid

        // Check for T-shapes at each position
        for (let row = 1; row < height - 1; row++) {
            for (let col = 1; col < width - 1; col++) {
                const centerType = cells[row][col].type

                // T shape orientations
                const tShapes = [
                    // T shape (top)
                    [
                        { row: row - 1, col: col },
                        { row: row, col: col - 1 },
                        { row: row, col: col },
                        { row: row, col: col + 1 },
                        { row: row + 1, col: col }
                    ],
                    // Add more T orientations...
                ]

                tShapes.forEach(shape => {
                    if (this.isValidTShape(cells, shape, centerType)) {
                        tMatches.push({
                            cells: shape,
                            type: 't_shape',
                            length: shape.length
                        })
                    }
                })
            }
        }

        return tMatches
    }

    private isLShapeMatch(match: Match): boolean {
        return match.type === 'l_shape'
    }

    private isTShapeMatch(match: Match): boolean {
        return match.type === 't_shape'
    }

    private isValidLShape(cells: EmojiCell[][], positions: GridPosition[], targetType: string): boolean {
        return positions.every(pos =>
            pos.row >= 0 &&
            pos.row < cells.length &&
            pos.col >= 0 &&
            pos.col < cells[0].length &&
            cells[pos.row][pos.col].type === targetType
        )
    }

    private isValidTShape(cells: EmojiCell[][], positions: GridPosition[], targetType: string): boolean {
        return positions.every(pos =>
            pos.row >= 0 &&
            pos.row < cells.length &&
            pos.col >= 0 &&
            pos.col < cells[0].length &&
            cells[pos.row][pos.col].type === targetType
        )
    }

    public getMatchPriority(match: Match): number {
        // Higher priority for special matches
        switch (match.type) {
            case 'l_shape':
            case 't_shape':
                return 100
            default:
                return match.length * 10
        }
    }

    public sortMatchesByPriority(matches: Match[]): Match[] {
        return matches.sort((a, b) => this.getMatchPriority(b) - this.getMatchPriority(a))
    }

    public mergeOverlappingMatches(matches: Match[]): Match[] {
        const merged: Match[] = []
        const processed = new Set<string>()

        matches.forEach(match => {
            const matchKey = this.getMatchKey(match)
            if (!processed.has(matchKey)) {
                processed.add(matchKey)
                merged.push(match)
            }
        })

        return merged
    }

    private getMatchKey(match: Match): string {
        const sortedCells = match.cells
            .map(cell => `${cell.row},${cell.col}`)
            .sort()
            .join('|')
        return `${match.type}:${sortedCells}`
    }

    public validateMatch(grid: GameGrid, match: Match): boolean {
        const { cells } = grid

        // Check if all cells in match have the same type
        if (match.cells.length < this.config.minMatchLength) {
            return false
        }

        const firstCell = cells[match.cells[0].row][match.cells[0].col]
        return match.cells.every(pos =>
            cells[pos.row][pos.col].type === firstCell.type
        )
    }

    public getMatchEffectArea(match: Match, specialType?: SpecialEmojiType): GridPosition[] {
        const effectArea: GridPosition[] = [...match.cells]

        if (specialType) {
            switch (specialType) {
                case 'horizontal_blast':
                    // Add entire row
                    const row = match.cells[0].row
                    for (let col = 0; col < this.config.gridWidth; col++) {
                        if (!effectArea.some(pos => pos.row === row && pos.col === col)) {
                            effectArea.push({ row, col })
                        }
                    }
                    break

                case 'vertical_blast':
                    // Add entire column
                    const col = match.cells[0].col
                    for (let row = 0; row < this.config.gridHeight; row++) {
                        if (!effectArea.some(pos => pos.row === row && pos.col === col)) {
                            effectArea.push({ row, col })
                        }
                    }
                    break

                case 'bomb':
                    // Add 3x3 area around match center
                    const centerRow = Math.floor(match.cells.reduce((sum, pos) => sum + pos.row, 0) / match.cells.length)
                    const centerCol = Math.floor(match.cells.reduce((sum, pos) => sum + pos.col, 0) / match.cells.length)

                    for (let r = centerRow - 1; r <= centerRow + 1; r++) {
                        for (let c = centerCol - 1; c <= centerCol + 1; c++) {
                            if (r >= 0 && r < this.config.gridHeight && c >= 0 && c < this.config.gridWidth) {
                                if (!effectArea.some(pos => pos.row === r && pos.col === c)) {
                                    effectArea.push({ row: r, col: c })
                                }
                            }
                        }
                    }
                    break
            }
        }

        return effectArea
    }
}