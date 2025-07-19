// Game Types for EmoCrush

export type EmojiType =
    | '😀' | '😂' | '😍' | '🤔' | '😎' | '🥳' | '😴' | '🤯'
    | '🔥' | '⭐' | '💎' | '🌟' | '⚡' | '💥' | '🎯' | '🎪';

export interface GridPosition {
    row: number;
    col: number;
}

export interface EmojiCell {
    id: string;
    type: EmojiType;
    position: GridPosition;
    isMatched: boolean;
    isSpecial: boolean;
    specialType?: SpecialEmojiType;
    animationState?: AnimationState;
}

export type SpecialEmojiType =
    | 'horizontal_blast'
    | 'vertical_blast'
    | 'bomb'
    | 'rainbow'
    | 'lightning';

export type AnimationState =
    | 'idle'
    | 'falling'
    | 'swapping'
    | 'matching'
    | 'exploding'
    | 'spawning';

export interface GameGrid {
    cells: EmojiCell[][];
    width: number;
    height: number;
}

export interface Match {
    cells: GridPosition[];
    type: 'horizontal' | 'vertical' | 'l_shape' | 't_shape';
    length: number;
    specialGenerated?: SpecialEmojiType;
}

export interface GameState {
    grid: GameGrid;
    score: number;
    level: number;
    moves: number;
    maxMoves: number;
    objectives: LevelObjective[];
    gameStatus: GameStatus;
    selectedCell: GridPosition | null;
    isProcessing: boolean;
    combo: number;
    timeRemaining?: number;
}

export type GameStatus =
    | 'menu'
    | 'playing'
    | 'paused'
    | 'level_complete'
    | 'game_over'
    | 'loading';

export interface LevelObjective {
    id: string;
    type: 'score' | 'collect_emoji' | 'clear_obstacles' | 'time_limit';
    target: number;
    current: number;
    description: string;
    completed: boolean;
}

export interface PowerUp {
    id: string;
    type: 'hammer' | 'shuffle' | 'extra_moves' | 'color_bomb';
    count: number;
    description: string;
}

export interface GameConfig {
    gridWidth: number;
    gridHeight: number;
    emojiTypes: EmojiType[];
    minMatchLength: number;
    gravitySpeed: number;
    animationDuration: number;
    comboMultiplier: number;
}

export interface LevelConfig {
    level: number;
    maxMoves: number;
    timeLimit?: number;
    objectives: Omit<LevelObjective, 'current' | 'completed'>[];
    targetScore: number;
    availableEmojis: EmojiType[];
    obstacles?: GridPosition[];
    powerUps?: PowerUp[];
}

// Phaser-specific types
export interface PhaserGameData {
    scene: Phaser.Scene;
    gameConfig: GameConfig;
    onGameStateChange: (state: Partial<GameState>) => void;
}

// Animation and Effects
export interface ParticleEffect {
    type: 'explosion' | 'sparkle' | 'trail' | 'combo';
    position: GridPosition;
    duration: number;
    intensity: number;
}

export interface SoundEffect {
    type: 'match' | 'swap' | 'special' | 'combo' | 'level_complete' | 'game_over';
    volume: number;
    pitch?: number;
}

// UI State
export interface UIState {
    showPauseMenu: boolean;
    showLevelComplete: boolean;
    showGameOver: boolean;
    showSettings: boolean;
    showTutorial: boolean;
    notifications: GameNotification[];
}

export interface GameNotification {
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    message: string;
    duration: number;
    timestamp: number;
}

// Settings
export interface GameSettings {
    soundEnabled: boolean;
    musicEnabled: boolean;
    soundVolume: number;
    musicVolume: number;
    vibrationEnabled: boolean;
    showHints: boolean;
    animationSpeed: 'slow' | 'normal' | 'fast';
}

// Player Progress
export interface PlayerProgress {
    currentLevel: number;
    highScore: number;
    totalScore: number;
    levelsCompleted: number;
    achievements: Achievement[];
    powerUpsOwned: PowerUp[];
    settings: GameSettings;
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    unlocked: boolean;
    unlockedAt?: number;
    progress: number;
    target: number;
}