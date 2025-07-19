import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import {
    GameState,
    GridPosition,
    EmojiCell,
    GameStatus,
    Match,
    GameConfig
} from '@/types/game'
import { createInitialGrid } from '@/utils/gameUtils'

const initialGameConfig: GameConfig = {
    gridWidth: 8,
    gridHeight: 8,
    emojiTypes: ['😀', '😂', '😍', '🤔', '😎', '🥳', '😴', '🤯'],
    minMatchLength: 3,
    gravitySpeed: 300,
    animationDuration: 250,
    comboMultiplier: 1.5,
}

const initialState: GameState = {
    grid: createInitialGrid(initialGameConfig.gridWidth, initialGameConfig.gridHeight),
    score: 0,
    level: 1,
    moves: 0,
    maxMoves: 30,
    objectives: [
        {
            id: 'score_target',
            type: 'score',
            target: 10000,
            current: 0,
            description: 'Reach 10,000 points',
            completed: false,
        }
    ],
    gameStatus: 'menu',
    selectedCell: null,
    isProcessing: false,
    combo: 0,
}

const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        // Game State Management
        startGame: (state) => {
            state.gameStatus = 'playing'
            state.score = 0
            state.moves = 0
            state.combo = 0
            state.selectedCell = null
            state.isProcessing = false
            // Reset objectives
            state.objectives.forEach(obj => {
                obj.current = 0
                obj.completed = false
            })
        },

        pauseGame: (state) => {
            if (state.gameStatus === 'playing') {
                state.gameStatus = 'paused'
            }
        },

        resumeGame: (state) => {
            if (state.gameStatus === 'paused') {
                state.gameStatus = 'playing'
            }
        },

        endGame: (state, action: PayloadAction<'level_complete' | 'game_over'>) => {
            state.gameStatus = action.payload
            state.selectedCell = null
            state.isProcessing = false
        },

        // Grid Management
        updateGrid: (state, action: PayloadAction<EmojiCell[][]>) => {
            state.grid.cells = action.payload
        },

        selectCell: (state, action: PayloadAction<GridPosition | null>) => {
            if (!state.isProcessing) {
                state.selectedCell = action.payload
            }
        },

        setProcessing: (state, action: PayloadAction<boolean>) => {
            state.isProcessing = action.payload
            if (action.payload) {
                state.selectedCell = null
            }
        },

        // Scoring and Progress
        addScore: (state, action: PayloadAction<number>) => {
            const baseScore = action.payload
            const comboBonus = Math.floor(baseScore * (state.combo * 0.1))
            const totalScore = baseScore + comboBonus

            state.score += totalScore

            // Update score objectives
            state.objectives.forEach(obj => {
                if (obj.type === 'score') {
                    obj.current = state.score
                    obj.completed = obj.current >= obj.target
                }
            })
        },

        incrementCombo: (state) => {
            state.combo += 1
        },

        resetCombo: (state) => {
            state.combo = 0
        },

        useMove: (state) => {
            if (state.moves < state.maxMoves) {
                state.moves += 1
            }

            // Check if game should end due to no moves left
            if (state.moves >= state.maxMoves) {
                const allObjectivesComplete = state.objectives.every(obj => obj.completed)
                state.gameStatus = allObjectivesComplete ? 'level_complete' : 'game_over'
            }
        },

        // Level Management
        nextLevel: (state) => {
            state.level += 1
            state.moves = 0
            state.maxMoves = Math.min(30 + state.level * 2, 50) // Increase moves per level
            state.combo = 0
            state.selectedCell = null
            state.isProcessing = false
            state.gameStatus = 'playing'

            // Update objectives for new level
            state.objectives = [
                {
                    id: 'score_target',
                    type: 'score',
                    target: 10000 * state.level,
                    current: 0,
                    description: `Reach ${(10000 * state.level).toLocaleString()} points`,
                    completed: false,
                }
            ]
        },

        // Objective Management
        updateObjective: (state, action: PayloadAction<{ id: string; progress: number }>) => {
            const { id, progress } = action.payload
            const objective = state.objectives.find(obj => obj.id === id)
            if (objective) {
                objective.current = Math.min(objective.current + progress, objective.target)
                objective.completed = objective.current >= objective.target
            }
        },

        // Match Processing
        processMatches: (state, action: PayloadAction<Match[]>) => {
            const matches = action.payload
            if (matches.length > 0) {
                // Calculate score based on matches
                let matchScore = 0
                matches.forEach(match => {
                    matchScore += match.length * 100 * (match.length - 2) // Bonus for longer matches
                })

                // Add score with current combo
                const baseScore = matchScore
                const comboBonus = Math.floor(baseScore * (state.combo * 0.1))
                const totalScore = baseScore + comboBonus

                state.score += totalScore
                state.combo += 1

                // Update objectives
                state.objectives.forEach(obj => {
                    if (obj.type === 'score') {
                        obj.current = state.score
                        obj.completed = obj.current >= obj.target
                    }
                })
            } else {
                // No matches found, reset combo
                state.combo = 0
            }
        },

        // Reset game state
        resetGame: () => {
            return {
                ...initialState,
                grid: createInitialGrid(initialGameConfig.gridWidth, initialGameConfig.gridHeight),
            }
        },

        // Development/Debug actions
        setGameStatus: (state, action: PayloadAction<GameStatus>) => {
            state.gameStatus = action.payload
        },
    },
})

export const {
    startGame,
    pauseGame,
    resumeGame,
    endGame,
    updateGrid,
    selectCell,
    setProcessing,
    addScore,
    incrementCombo,
    resetCombo,
    useMove,
    nextLevel,
    updateObjective,
    processMatches,
    resetGame,
    setGameStatus,
} = gameSlice.actions

export default gameSlice.reducer