import { configureStore } from '@reduxjs/toolkit'
import gameReducer from './slices/gameSlice'
import uiReducer from './slices/uiSlice'
import playerReducer from './slices/playerSlice'

export const store = configureStore({
    reducer: {
        game: gameReducer,
        ui: uiReducer,
        player: playerReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these action types for serialization checks
                ignoredActions: ['game/updatePhaserScene'],
                // Ignore these field paths in all actions
                ignoredActionsPaths: ['payload.scene'],
                // Ignore these paths in the state
                ignoredPaths: ['game.phaserScene'],
            },
        }),
    devTools: process.env.NODE_ENV !== 'production',
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch