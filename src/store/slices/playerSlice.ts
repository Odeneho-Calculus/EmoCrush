import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { PlayerProgress, GameSettings, Achievement } from '@/types/game'

const defaultSettings: GameSettings = {
    soundEnabled: true,
    musicEnabled: true,
    soundVolume: 0.7,
    musicVolume: 0.5,
    vibrationEnabled: true,
    showHints: true,
    animationSpeed: 'normal',
}

const initialState: PlayerProgress = {
    currentLevel: 1,
    highScore: 0,
    totalScore: 0,
    levelsCompleted: 0,
    achievements: [],
    powerUpsOwned: [
        { id: 'hammer', type: 'hammer', count: 3, description: 'Remove any emoji' },
        { id: 'shuffle', type: 'shuffle', count: 2, description: 'Shuffle the board' },
        { id: 'extra_moves', type: 'extra_moves', count: 1, description: 'Add 5 extra moves' },
    ],
    settings: defaultSettings,
}

const playerSlice = createSlice({
    name: 'player',
    initialState,
    reducers: {
        // Score Management
        updateHighScore: (state, action: PayloadAction<number>) => {
            if (action.payload > state.highScore) {
                state.highScore = action.payload
            }
        },

        addToTotalScore: (state, action: PayloadAction<number>) => {
            state.totalScore += action.payload
        },

        // Level Progress
        completeLevel: (state, action: PayloadAction<{ level: number; score: number }>) => {
            const { level, score } = action.payload

            if (level > state.levelsCompleted) {
                state.levelsCompleted = level
            }

            if (level >= state.currentLevel) {
                state.currentLevel = level + 1
            }

            state.totalScore += score

            if (score > state.highScore) {
                state.highScore = score
            }
        },

        setCurrentLevel: (state, action: PayloadAction<number>) => {
            state.currentLevel = action.payload
        },

        // Settings Management
        updateSettings: (state, action: PayloadAction<Partial<GameSettings>>) => {
            state.settings = { ...state.settings, ...action.payload }
        },

        toggleSound: (state) => {
            state.settings.soundEnabled = !state.settings.soundEnabled
        },

        toggleMusic: (state) => {
            state.settings.musicEnabled = !state.settings.musicEnabled
        },

        setSoundVolume: (state, action: PayloadAction<number>) => {
            state.settings.soundVolume = Math.max(0, Math.min(1, action.payload))
        },

        setMusicVolume: (state, action: PayloadAction<number>) => {
            state.settings.musicVolume = Math.max(0, Math.min(1, action.payload))
        },

        toggleVibration: (state) => {
            state.settings.vibrationEnabled = !state.settings.vibrationEnabled
        },

        toggleHints: (state) => {
            state.settings.showHints = !state.settings.showHints
        },

        setAnimationSpeed: (state, action: PayloadAction<'slow' | 'normal' | 'fast'>) => {
            state.settings.animationSpeed = action.payload
        },

        // Achievement Management
        unlockAchievement: (state, action: PayloadAction<string>) => {
            const achievement = state.achievements.find(a => a.id === action.payload)
            if (achievement && !achievement.unlocked) {
                achievement.unlocked = true
                achievement.unlockedAt = Date.now()
            }
        },

        updateAchievementProgress: (state, action: PayloadAction<{ id: string; progress: number }>) => {
            const { id, progress } = action.payload
            const achievement = state.achievements.find(a => a.id === id)
            if (achievement) {
                achievement.progress = Math.min(progress, achievement.target)
                if (achievement.progress >= achievement.target && !achievement.unlocked) {
                    achievement.unlocked = true
                    achievement.unlockedAt = Date.now()
                }
            }
        },

        addAchievement: (state, action: PayloadAction<Achievement>) => {
            const existingAchievement = state.achievements.find(a => a.id === action.payload.id)
            if (!existingAchievement) {
                state.achievements.push(action.payload)
            }
        },

        // Power-up Management
        usePowerUp: (state, action: PayloadAction<string>) => {
            const powerUp = state.powerUpsOwned.find(p => p.id === action.payload)
            if (powerUp && powerUp.count > 0) {
                powerUp.count -= 1
            }
        },

        addPowerUp: (state, action: PayloadAction<{ id: string; count: number }>) => {
            const { id, count } = action.payload
            const powerUp = state.powerUpsOwned.find(p => p.id === id)
            if (powerUp) {
                powerUp.count += count
            }
        },

        setPowerUpCount: (state, action: PayloadAction<{ id: string; count: number }>) => {
            const { id, count } = action.payload
            const powerUp = state.powerUpsOwned.find(p => p.id === id)
            if (powerUp) {
                powerUp.count = Math.max(0, count)
            }
        },

        // Data Management
        resetProgress: (state) => {
            return {
                ...initialState,
                settings: state.settings, // Keep settings when resetting progress
            }
        },

        loadPlayerData: (state, action: PayloadAction<Partial<PlayerProgress>>) => {
            return { ...state, ...action.payload }
        },
    },
})

export const {
    updateHighScore,
    addToTotalScore,
    completeLevel,
    setCurrentLevel,
    updateSettings,
    toggleSound,
    toggleMusic,
    setSoundVolume,
    setMusicVolume,
    toggleVibration,
    toggleHints,
    setAnimationSpeed,
    unlockAchievement,
    updateAchievementProgress,
    addAchievement,
    usePowerUp,
    addPowerUp,
    setPowerUpCount,
    resetProgress,
    loadPlayerData,
} = playerSlice.actions

export default playerSlice.reducer