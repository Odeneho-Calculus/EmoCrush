import Phaser from 'phaser'
import { store } from '@/store/store'
import GameScene from './scenes/GameScene'
import { GameConfig } from '@/types/game'

export default class PhaserGame {
    private game: Phaser.Game | null = null
    private gameConfig: GameConfig

    constructor(parent: HTMLElement) {
        this.gameConfig = {
            gridWidth: 8,
            gridHeight: 8,
            emojiTypes: ['😀', '😂', '😍', '🤔', '😎', '🥳', '😴', '🤯'],
            minMatchLength: 3,
            gravitySpeed: 300,
            animationDuration: 250,
            comboMultiplier: 1.5,
        }

        this.initializeGame(parent)
    }

    private initializeGame(parent: HTMLElement): void {
        const config: Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            width: 600,
            height: 700,
            parent: parent,
            backgroundColor: '#f0f0f0',
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
                width: 600,
                height: 700,
            },
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { x: 0, y: 0 },
                    debug: false
                }
            },
            scene: [GameScene],
            render: {
                antialias: true,
                pixelArt: false,
                roundPixels: false
            }
        }

        this.game = new Phaser.Game(config)

        // Pass game configuration and Redux store to scenes
        this.game.registry.set('gameConfig', this.gameConfig)
        this.game.registry.set('reduxStore', store)
    }

    public destroy(): void {
        if (this.game) {
            this.game.destroy(true)
            this.game = null
        }
    }

    public getGame(): Phaser.Game | null {
        return this.game
    }

    public pause(): void {
        if (this.game) {
            this.game.scene.pause('GameScene')
        }
    }

    public resume(): void {
        if (this.game) {
            this.game.scene.resume('GameScene')
        }
    }

    public restart(): void {
        if (this.game) {
            this.game.scene.stop('GameScene')
            this.game.scene.start('GameScene')
        }
    }
}