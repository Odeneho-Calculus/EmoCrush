import Phaser from 'phaser'
import { GameConfig } from '@/types/game'
import EmojiSprite from '../objects/EmojiSprite'

export default class AnimationSystem {
    private scene: Phaser.Scene
    // private config: GameConfig
    private activeAnimations: Set<Phaser.Tweens.Tween> = new Set()
    private particleEmitters: Phaser.GameObjects.Particles.ParticleEmitter[] = []

    constructor(scene: Phaser.Scene, _config: GameConfig) {
        this.scene = scene
        // this.config = config
        this.setupParticleSystem()
    }

    private setupParticleSystem(): void {
        // Create particle emitters for various effects
        if (this.scene.add.particles) {
            // Match explosion particles
            const matchEmitter = this.scene.add.particles(0, 0, 'particle', {
                scale: { start: 0.5, end: 0 },
                speed: { min: 50, max: 150 },
                lifespan: 600,
                quantity: 10,
                emitting: false
            })
            this.particleEmitters.push(matchEmitter)
        }
    }

    public async swapSprites(sprite1: EmojiSprite, sprite2: EmojiSprite): Promise<void> {
        const pos1 = { x: sprite1.x, y: sprite1.y }
        const pos2 = { x: sprite2.x, y: sprite2.y }

        // const duration = this.getAnimationDuration('swap')

        const promises = [
            sprite1.animateSwap(pos2.x, pos2.y),
            sprite2.animateSwap(pos1.x, pos1.y)
        ]

        await Promise.all(promises)
    }

    public async animateMatches(sprites: EmojiSprite[]): Promise<void> {
        const promises = sprites.map(sprite => {
            this.createMatchExplosion(sprite.x, sprite.y)
            return sprite.animateMatch()
        })

        await Promise.all(promises)
    }

    public async animateFall(sprite: EmojiSprite, targetY: number): Promise<void> {
        return sprite.animateFall(targetY)
    }

    public async animateSpawn(sprite: EmojiSprite): Promise<void> {
        return sprite.animateSpawn()
    }

    public async shakeSprite(sprite: EmojiSprite): Promise<void> {
        return sprite.shake()
    }

    public async pulseSprite(sprite: EmojiSprite, color?: number): Promise<void> {
        return sprite.pulse(color)
    }

    public createMatchExplosion(x: number, y: number): void {
        if (this.particleEmitters.length > 0) {
            const emitter = this.particleEmitters[0]
            emitter.setPosition(x, y)
            emitter.explode(15)
        }

        // Create screen shake effect
        this.createScreenShake(2, 100)
    }

    public createScreenShake(intensity: number, duration: number): void {
        if (this.scene.cameras && this.scene.cameras.main) {
            this.scene.cameras.main.shake(duration, intensity)
        }
    }

    public createComboEffect(x: number, y: number, comboCount: number): void {
        // Create combo text
        const comboText = this.scene.add.text(x, y, `${comboCount}x COMBO!`, {
            fontSize: '24px',
            color: '#ffff00',
            stroke: '#000000',
            strokeThickness: 2
        })
        comboText.setOrigin(0.5, 0.5)

        // Animate combo text
        this.scene.tweens.add({
            targets: comboText,
            y: y - 50,
            alpha: 0,
            scaleX: 1.5,
            scaleY: 1.5,
            duration: 1000,
            ease: 'Power2.easeOut',
            onComplete: () => {
                comboText.destroy()
            }
        })

        // Create extra particles for combo
        if (this.particleEmitters.length > 0) {
            const emitter = this.particleEmitters[0]
            emitter.setPosition(x, y)
            emitter.explode(comboCount * 5)
        }
    }

    public createScorePopup(x: number, y: number, score: number): void {
        const scoreText = this.scene.add.text(x, y, `+${score}`, {
            fontSize: '20px',
            color: '#00ff00',
            stroke: '#000000',
            strokeThickness: 2
        })
        scoreText.setOrigin(0.5, 0.5)

        this.scene.tweens.add({
            targets: scoreText,
            y: y - 30,
            alpha: 0,
            duration: 800,
            ease: 'Power2.easeOut',
            onComplete: () => {
                scoreText.destroy()
            }
        })
    }

    public animateGridShuffle(sprites: EmojiSprite[][]): Promise<void> {
        return new Promise((resolve) => {
            const allSprites = sprites.flat()
            let completedAnimations = 0

            allSprites.forEach((sprite, index) => {
                // Stagger the animations
                this.scene.time.delayedCall(index * 50, () => {
                    this.scene.tweens.add({
                        targets: sprite,
                        scaleX: 0,
                        scaleY: 0,
                        rotation: Math.PI * 2,
                        duration: 300,
                        ease: 'Back.easeIn',
                        onComplete: () => {
                            // Change the emoji type here if needed
                            this.scene.tweens.add({
                                targets: sprite,
                                scaleX: 1,
                                scaleY: 1,
                                rotation: 0,
                                duration: 300,
                                ease: 'Back.easeOut',
                                onComplete: () => {
                                    completedAnimations++
                                    if (completedAnimations === allSprites.length) {
                                        resolve()
                                    }
                                }
                            })
                        }
                    })
                })
            })
        })
    }

    public createHintAnimation(sprite: EmojiSprite): void {
        // Create a subtle glow effect to hint at possible moves
        const hintTween = this.scene.tweens.add({
            targets: sprite,
            alpha: 0.7,
            duration: 500,
            yoyo: true,
            repeat: 2,
            ease: 'Sine.easeInOut'
        })

        this.activeAnimations.add(hintTween)
    }

    public createPowerUpEffect(x: number, y: number, type: string): void {
        let color = 0xffffff
        let particleCount = 20

        switch (type) {
            case 'horizontal_blast':
                color = 0xff0000
                particleCount = 30
                break
            case 'vertical_blast':
                color = 0x0000ff
                particleCount = 30
                break
            case 'bomb':
                color = 0xff8800
                particleCount = 50
                break
            case 'rainbow':
                color = 0xff00ff
                particleCount = 100
                break
        }

        if (this.particleEmitters.length > 0) {
            const emitter = this.particleEmitters[0]
            emitter.setPosition(x, y)
            // emitter.setTint(color) // Not available on ParticleEmitter
            emitter.explode(particleCount)
        }

        // Create screen flash
        this.createScreenFlash(color, 200)
    }

    public createScreenFlash(color: number, duration: number): void {
        const flash = this.scene.add.rectangle(
            this.scene.scale.width / 2,
            this.scene.scale.height / 2,
            this.scene.scale.width,
            this.scene.scale.height,
            color,
            0.3
        )

        this.scene.tweens.add({
            targets: flash,
            alpha: 0,
            duration: duration,
            onComplete: () => {
                flash.destroy()
            }
        })
    }

    public animateObjectiveComplete(text: string): void {
        const objectiveText = this.scene.add.text(
            this.scene.scale.width / 2,
            this.scene.scale.height / 2,
            text,
            {
                fontSize: '32px',
                color: '#00ff00',
                stroke: '#000000',
                strokeThickness: 3
            }
        )
        objectiveText.setOrigin(0.5, 0.5)

        this.scene.tweens.add({
            targets: objectiveText,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 300,
            yoyo: true,
            onComplete: () => {
                this.scene.tweens.add({
                    targets: objectiveText,
                    alpha: 0,
                    y: objectiveText.y - 100,
                    duration: 1000,
                    onComplete: () => {
                        objectiveText.destroy()
                    }
                })
            }
        })
    }

    // private getAnimationDuration(type: string): number {
    //     const speedMultiplier = this.getSpeedMultiplier()

    //     switch (type) {
    //         case 'swap': return this.config.animationDuration * speedMultiplier
    //         case 'match': return 300 * speedMultiplier
    //         case 'fall': return 400 * speedMultiplier
    //         case 'spawn': return 400 * speedMultiplier
    //         default: return 250 * speedMultiplier
    //     }
    // }

    // private getSpeedMultiplier(): number {
    //     // This could be connected to player settings
    //     return 1.0 // Normal speed
    // }

    public stopAllAnimations(): void {
        this.activeAnimations.forEach(tween => {
            if (tween && tween.isActive()) {
                tween.stop()
            }
        })
        this.activeAnimations.clear()
    }

    public update(): void {
        // Clean up completed animations
        this.activeAnimations.forEach(tween => {
            if (!tween.isActive()) {
                this.activeAnimations.delete(tween)
            }
        })
    }

    public destroy(): void {
        this.stopAllAnimations()
        this.particleEmitters.forEach(emitter => {
            if (emitter && emitter.destroy) {
                emitter.destroy()
            }
        })
        this.particleEmitters = []
    }
}