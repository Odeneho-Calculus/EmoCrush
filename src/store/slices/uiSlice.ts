import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { UIState, GameNotification } from '@/types/game'

const initialState: UIState = {
    showPauseMenu: false,
    showLevelComplete: false,
    showGameOver: false,
    showSettings: false,
    showTutorial: false,
    notifications: [],
}

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        // Menu Management
        showPauseMenu: (state) => {
            state.showPauseMenu = true
        },

        hidePauseMenu: (state) => {
            state.showPauseMenu = false
        },

        showLevelComplete: (state) => {
            state.showLevelComplete = true
        },

        hideLevelComplete: (state) => {
            state.showLevelComplete = false
        },

        showGameOver: (state) => {
            state.showGameOver = true
        },

        hideGameOver: (state) => {
            state.showGameOver = false
        },

        showSettings: (state) => {
            state.showSettings = true
        },

        hideSettings: (state) => {
            state.showSettings = false
        },

        showTutorial: (state) => {
            state.showTutorial = true
        },

        hideTutorial: (state) => {
            state.showTutorial = false
        },

        // Notification Management
        addNotification: (state, action: PayloadAction<Omit<GameNotification, 'id' | 'timestamp'>>) => {
            const notification: GameNotification = {
                ...action.payload,
                id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                timestamp: Date.now(),
            }
            state.notifications.push(notification)
        },

        removeNotification: (state, action: PayloadAction<string>) => {
            state.notifications = state.notifications.filter(
                notification => notification.id !== action.payload
            )
        },

        clearNotifications: (state) => {
            state.notifications = []
        },

        // Bulk UI State Management
        hideAllMenus: (state) => {
            state.showPauseMenu = false
            state.showLevelComplete = false
            state.showGameOver = false
            state.showSettings = false
            state.showTutorial = false
        },

        resetUI: () => {
            return initialState
        },
    },
})

export const {
    showPauseMenu,
    hidePauseMenu,
    showLevelComplete,
    hideLevelComplete,
    showGameOver,
    hideGameOver,
    showSettings,
    hideSettings,
    showTutorial,
    hideTutorial,
    addNotification,
    removeNotification,
    clearNotifications,
    hideAllMenus,
    resetUI,
} = uiSlice.actions

export default uiSlice.reducer