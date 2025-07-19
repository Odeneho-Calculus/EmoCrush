import React from 'react'
import styled from 'styled-components'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { useAppSelector } from '@/hooks/useAppSelector'
import { startGame } from '@/store/slices/gameSlice'
import { showSettings } from '@/store/slices/uiSlice'

const MenuContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  min-width: 300px;

  @media (max-width: 768px) {
    min-width: 280px;
    padding: 1.5rem;
    gap: 1rem;
  }
`

const MenuButton = styled.button`
  padding: 1rem 2rem;
  font-size: 1.2rem;
  font-weight: bold;
  color: #ffffff;
  background: linear-gradient(45deg, #ff6b6b, #ee5a24);
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  min-width: 200px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
    background: linear-gradient(45deg, #ff5252, #d63031);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    padding: 0.8rem 1.5rem;
    font-size: 1rem;
    min-width: 180px;
  }
`

const SecondaryButton = styled(MenuButton)`
  background: linear-gradient(45deg, #74b9ff, #0984e3);

  &:hover {
    background: linear-gradient(45deg, #5a9cff, #0770c4);
  }
`

const StatsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  min-width: 250px;
`

const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  color: #ffffff;
  font-size: 1rem;

  .label {
    font-weight: normal;
  }

  .value {
    font-weight: bold;
    color: #ffd700;
  }
`

const EmojiDecoration = styled.div`
  font-size: 2rem;
  margin: 0.5rem 0;
  animation: bounce 2s infinite;

  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-10px);
    }
    60% {
      transform: translateY(-5px);
    }
  }
`

const MainMenu: React.FC = () => {
    const dispatch = useAppDispatch()
    const { highScore, currentLevel, levelsCompleted } = useAppSelector(state => state.player)

    const handleStartGame = () => {
        dispatch(startGame())
    }

    const handleShowSettings = () => {
        dispatch(showSettings())
    }

    return (
        <MenuContainer>
            <EmojiDecoration>🎯🎮🏆</EmojiDecoration>

            <MenuButton onClick={handleStartGame}>
                🚀 Start Game
            </MenuButton>

            <SecondaryButton onClick={handleShowSettings}>
                ⚙️ Settings
            </SecondaryButton>

            <StatsContainer>
                <StatItem>
                    <span className="label">🏆 High Score:</span>
                    <span className="value">{highScore.toLocaleString()}</span>
                </StatItem>
                <StatItem>
                    <span className="label">📊 Current Level:</span>
                    <span className="value">{currentLevel}</span>
                </StatItem>
                <StatItem>
                    <span className="label">✅ Levels Completed:</span>
                    <span className="value">{levelsCompleted}</span>
                </StatItem>
            </StatsContainer>

            <EmojiDecoration>🌟💎⭐</EmojiDecoration>
        </MenuContainer>
    )
}

export default MainMenu