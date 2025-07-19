import {
    EmojiType,
    EmojiCell,
    GameGrid,
    GridPosition,
    Match
} from '@/types/game'

// Available emoji types for the game
export const EMOJI_TYPES: EmojiType[] = [
    '😀', '😂', '😍', '🤔', '😎', '🥳', '😴', '🤯'
]

/**
 * Creates an initial game grid with random emojis
 */
export function createInitialGrid(width: number, height: number): GameGrid {
    const cells: EmojiCell[][] = []

    for (let row = 0; row < height; row++) {
        cells[row] = []
        for (let col = 0; col < width; col++) {
            cells[row][col] = createRandomEmojiCell(row, col)
        }
    }

    // Ensure no initial matches exist
    removeInitialMatches(cells)

    return {
        cells,
        width,
        height
    }
}

/**
 * Creates a random emoji cell at the specified position
 */
export function createRandomEmojiCell(row: number, col: number): EmojiCell {
    const randomType = EMOJI_TYPES[Math.floor(Math.random() * EMOJI_TYPES.length)]

    return {
        id: `emoji_${row}_${col}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: randomType,
        position: { row, col },
        isMatched: false,
        isSpecial: false,
        animationState: 'idle'
    }
}

/**
 * Removes any initial matches from the grid to ensure a valid starting state
 */
function removeInitialMatches(cells: EmojiCell[][]): void {
    const height = cells.length
    const width = cells[0].length

    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
            // Check horizontal matches
            if (col >= 2) {
                if (cells[row][col].type === cells[row][col - 1].type &&
                    cells[row][col].type === cells[row][col - 2].type) {
                    // Replace current cell with a different type
                    cells[row][col] = createDifferentEmojiCell(row, col, [
                        cells[row][col - 1].type,
                        cells[row][col - 2].type
                    ])
                }
            }

            // Check vertical matches
            if (row >= 2) {
                if (cells[row][col].type === cells[row - 1][col].type &&
                    cells[row][col].type === cells[row - 2][col].type) {
                    // Replace current cell with a different type
                    cells[row][col] = createDifferentEmojiCell(row, col, [
                        cells[row - 1][col].type,
                        cells[row - 2][col].type
                    ])
                }
            }
        }
    }
}

/**
 * Creates an emoji cell with a type different from the excluded types
 */
function createDifferentEmojiCell(row: number, col: number, excludeTypes: EmojiType[]): EmojiCell {
    const availableTypes = EMOJI_TYPES.filter(type => !excludeTypes.includes(type))
    const randomType = availableTypes[Math.floor(Math.random() * availableTypes.length)]

    return {
        id: `emoji_${row}_${col}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: randomType,
        position: { row, col },
        isMatched: false,
        isSpecial: false,
        animationState: 'idle'
    }
}

/**
 * Finds all matches in the current grid
 */
export function findMatches(grid: GameGrid): Match[] {
    const matches: Match[] = []
    const { cells, width, height } = grid

    // Find horizontal matches
    for (let row = 0; row < height; row++) {
        let matchStart = 0
        let currentType = cells[row][0].type

        for (let col = 1; col <= width; col++) {
            const cellType = col < width ? cells[row][col].type : null

            if (cellType !== currentType || col === width) {
                const matchLength = col - matchStart
                if (matchLength >= 3) {
                    const matchCells: GridPosition[] = []
                    for (let i = matchStart; i < col; i++) {
                        matchCells.push({ row, col: i })
                    }
                    matches.push({
                        cells: matchCells,
                        type: 'horizontal',
                        length: matchLength
                    })
                }
                matchStart = col
                currentType = cellType!
            }
        }
    }

    // Find vertical matches
    for (let col = 0; col < width; col++) {
        let matchStart = 0
        let currentType = cells[0][col].type

        for (let row = 1; row <= height; row++) {
            const cellType = row < height ? cells[row][col].type : null

            if (cellType !== currentType || row === height) {
                const matchLength = row - matchStart
                if (matchLength >= 3) {
                    const matchCells: GridPosition[] = []
                    for (let i = matchStart; i < row; i++) {
                        matchCells.push({ row: i, col })
                    }
                    matches.push({
                        cells: matchCells,
                        type: 'vertical',
                        length: matchLength
                    })
                }
                matchStart = row
                currentType = cellType!
            }
        }
    }

    return matches
}

/**
 * Checks if two positions are adjacent (horizontally or vertically)
 */
export function arePositionsAdjacent(pos1: GridPosition, pos2: GridPosition): boolean {
    const rowDiff = Math.abs(pos1.row - pos2.row)
    const colDiff = Math.abs(pos1.col - pos2.col)

    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)
}

/**
 * Swaps two cells in the grid
 */
export function swapCells(grid: GameGrid, pos1: GridPosition, pos2: GridPosition): GameGrid {
    // Deep clone cells to avoid immutability issues
    const newCells = grid.cells.map(row =>
        row.map(cell => ({
            ...cell,
            position: { ...cell.position }
        }))
    )

    // Swap the cells
    const temp = newCells[pos1.row][pos1.col]
    newCells[pos1.row][pos1.col] = newCells[pos2.row][pos2.col]
    newCells[pos2.row][pos2.col] = temp

    // Update positions by creating new objects
    newCells[pos1.row][pos1.col] = {
        ...newCells[pos1.row][pos1.col],
        position: { ...pos1 }
    }
    newCells[pos2.row][pos2.col] = {
        ...newCells[pos2.row][pos2.col],
        position: { ...pos2 }
    }

    return {
        ...grid,
        cells: newCells
    }
}

/**
 * Applies gravity to the grid, making emojis fall down
 */
export function applyGravity(grid: GameGrid): GameGrid {
    // Deep clone cells to avoid immutability issues
    const newCells = grid.cells.map(row =>
        row.map(cell => ({
            ...cell,
            position: { ...cell.position }
        }))
    )
    const { width, height } = grid

    for (let col = 0; col < width; col++) {
        // Collect all non-matched cells in this column
        const nonMatchedCells: EmojiCell[] = []

        for (let row = height - 1; row >= 0; row--) {
            if (!newCells[row][col].isMatched) {
                nonMatchedCells.push(newCells[row][col])
            }
        }

        // Fill column from bottom up
        for (let row = height - 1; row >= 0; row--) {
            const cellIndex = height - 1 - row
            if (cellIndex < nonMatchedCells.length) {
                newCells[row][col] = {
                    ...nonMatchedCells[cellIndex],
                    position: { row, col },
                    animationState: 'falling'
                }
            } else {
                // Create new cell at the top
                newCells[row][col] = {
                    ...createRandomEmojiCell(row, col),
                    animationState: 'spawning'
                }
            }
        }
    }

    return {
        ...grid,
        cells: newCells
    }
}

/**
 * Removes matched cells from the grid
 */
export function removeMatches(grid: GameGrid, matches: Match[]): GameGrid {
    // Deep clone cells to avoid immutability issues
    const newCells = grid.cells.map(row =>
        row.map(cell => ({
            ...cell,
            position: { ...cell.position }
        }))
    )

    matches.forEach(match => {
        match.cells.forEach(pos => {
            newCells[pos.row][pos.col] = {
                ...newCells[pos.row][pos.col],
                isMatched: true,
                animationState: 'matching'
            }
        })
    })

    return {
        ...grid,
        cells: newCells
    }
}

/**
 * Checks if the grid is stable (no matches and no falling emojis)
 */
export function isGridStable(grid: GameGrid): boolean {
    const matches = findMatches(grid)
    return matches.length === 0
}

/**
 * Generates possible moves for hint system
 */
export function findPossibleMoves(grid: GameGrid): GridPosition[][] {
    const possibleMoves: GridPosition[][] = []
    const { width, height } = grid

    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
            const currentPos = { row, col }

            // Check adjacent positions
            const adjacentPositions = [
                { row: row - 1, col }, // Up
                { row: row + 1, col }, // Down
                { row, col: col - 1 }, // Left
                { row, col: col + 1 }, // Right
            ].filter(pos =>
                pos.row >= 0 && pos.row < height &&
                pos.col >= 0 && pos.col < width
            )

            adjacentPositions.forEach(adjacentPos => {
                // Simulate swap
                const testGrid = swapCells(grid, currentPos, adjacentPos)
                const matches = findMatches(testGrid)

                if (matches.length > 0) {
                    possibleMoves.push([currentPos, adjacentPos])
                }
            })
        }
    }

    return possibleMoves
}

/**
 * Shuffles the grid when no moves are available
 */
export function shuffleGrid(grid: GameGrid): GameGrid {
    // Deep clone cells to avoid immutability issues
    const newCells = grid.cells.map(row =>
        row.map(cell => ({
            ...cell,
            position: { ...cell.position }
        }))
    )
    const { width, height } = grid

    // Collect all emoji types
    const allTypes: EmojiType[] = []
    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
            allTypes.push(newCells[row][col].type)
        }
    }

    // Shuffle the types array
    for (let i = allTypes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allTypes[i], allTypes[j]] = [allTypes[j], allTypes[i]]
    }

    // Assign shuffled types back to cells
    let typeIndex = 0
    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
            newCells[row][col] = {
                ...newCells[row][col],
                type: allTypes[typeIndex],
                animationState: 'idle'
            }
            typeIndex++
        }
    }

    return {
        ...grid,
        cells: newCells
    }
}

/**
 * Calculates score based on match properties
 */
export function calculateMatchScore(match: Match): number {
    const baseScore = 100
    const lengthMultiplier = match.length - 2 // Extra points for longer matches
    const typeMultiplier = match.type === 'horizontal' ? 1 : 1.1 // Slight bonus for vertical matches

    return Math.floor(baseScore * lengthMultiplier * typeMultiplier)
}

/**
 * Validates if a move is legal
 */
export function isValidMove(grid: GameGrid, pos1: GridPosition, pos2: GridPosition): boolean {
    const { width, height } = grid

    // Check if positions are within bounds
    if (pos1.row < 0 || pos1.row >= height || pos1.col < 0 || pos1.col >= width ||
        pos2.row < 0 || pos2.row >= height || pos2.col < 0 || pos2.col >= width) {
        return false
    }

    // Check if positions are adjacent
    if (!arePositionsAdjacent(pos1, pos2)) {
        return false
    }

    // Simulate the swap and check for matches
    const testGrid = swapCells(grid, pos1, pos2)
    const matches = findMatches(testGrid)

    return matches.length > 0
}