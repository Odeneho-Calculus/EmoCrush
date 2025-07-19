import styled from 'styled-components'
import { useAppSelector } from '@/hooks/useAppSelector'
import GameContainer from '@/components/GameContainer'
import MainMenu from '@/components/MainMenu'
import PauseMenu from '@/components/PauseMenu'
import LevelCompleteModal from '@/components/LevelCompleteModal'
import GameOverModal from '@/components/GameOverModal'
import SettingsModal from '@/components/SettingsModal'
import NotificationSystem from '@/components/NotificationSystem'
import './App.css'

const AppContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Arial', sans-serif;
  overflow: hidden;
  position: relative;
`

const GameTitle = styled.h1`
  font-size: 3rem;
  font-weight: bold;
  color: #ffffff;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  margin: 0 0 1rem 0;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 2rem;
    margin: 0 0 0.5rem 0;
  }
`

const EmojiTitle = styled.span`
  font-size: 3.5rem;
  margin: 0 0.5rem;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`

function App() {
  const gameStatus = useAppSelector(state => state.game.gameStatus)
  const showPauseMenu = useAppSelector(state => state.ui.showPauseMenu)
  const showLevelComplete = useAppSelector(state => state.ui.showLevelComplete)
  const showGameOver = useAppSelector(state => state.ui.showGameOver)
  const showSettings = useAppSelector(state => state.ui.showSettings)

  return (
    <AppContainer>
      <GameTitle>
        <EmojiTitle>😀</EmojiTitle>
        EmoCrush
        <EmojiTitle>🎮</EmojiTitle>
      </GameTitle>

      {gameStatus === 'menu' && <MainMenu />}
      {(gameStatus === 'playing' || gameStatus === 'paused') && <GameContainer />}

      {/* Modal Overlays */}
      {showPauseMenu && <PauseMenu />}
      {showLevelComplete && <LevelCompleteModal />}
      {showGameOver && <GameOverModal />}
      {showSettings && <SettingsModal />}

      {/* Notification System */}
      <NotificationSystem />
    </AppContainer>
  )
}

export default App