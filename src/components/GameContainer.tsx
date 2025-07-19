import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'

import { useAppDispatch } from '@/hooks/useAppDispatch'
import { pauseGame } from '@/store/slices/gameSlice'
import { showPauseMenu } from '@/store/slices/uiSlice'
import GameUI from '@/components/GameUI'
import PhaserGame from '@/game/PhaserGame'

const GameWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 100%;
  height: 100vh;
  max-width: 800px;
  padding: 1rem;
  position: relative;

  @media (max-width: 768px) {
    padding: 0.5rem;
    gap: 0.5rem;
    height: 100vh;
  }

  @media (max-height: 700px) {
    gap: 0.25rem;
    padding: 0.25rem;
  }
`

const GameCanvas = styled.div`
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  width: 100%;
  max-width: 500px;

  canvas {
    display: block;
    border-radius: 15px;
    max-width: 100%;
    max-height: 100%;
  }

  @media (max-width: 768px) {
    min-height: 350px;
  }

  @media (max-height: 700px) {
    min-height: 300px;
  }
`

const PauseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  font-weight: bold;
  color: #ffffff;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  z-index: 100;

  &:hover {
    background: rgba(0, 0, 0, 0.7);
    transform: scale(1.05);
  }

  @media (max-width: 768px) {
    top: 0.5rem;
    right: 0.5rem;
    padding: 0.4rem 0.8rem;
    font-size: 0.9rem;
  }
`

const GameContainer: React.FC = () => {
  const dispatch = useAppDispatch()
  const gameCanvasRef = useRef<HTMLDivElement>(null)
  const phaserGameRef = useRef<PhaserGame | null>(null)
  // const gameStatus = useAppSelector(state => state.game.gameStatus)

  useEffect(() => {
    if (gameCanvasRef.current && !phaserGameRef.current) {
      // Initialize Phaser game
      phaserGameRef.current = new PhaserGame(gameCanvasRef.current)
    }

    return () => {
      // Cleanup Phaser game on unmount
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy()
        phaserGameRef.current = null
      }
    }
  }, [])

  const handlePause = () => {
    dispatch(pauseGame())
    dispatch(showPauseMenu())
  }

  return (
    <GameWrapper>
      <PauseButton onClick={handlePause}>
        ⏸️ Pause
      </PauseButton>

      <GameUI />

      <GameCanvas ref={gameCanvasRef} />
    </GameWrapper>
  )
}

export default GameContainer