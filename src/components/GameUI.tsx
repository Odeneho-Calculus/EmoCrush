import React from 'react'
import styled from 'styled-components'
import { useAppSelector } from '@/hooks/useAppSelector'

const UIContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 600px;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.2);

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    padding: 0.8rem;
  }
`

const StatGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;

  @media (max-width: 768px) {
    flex-direction: row;
    gap: 0.5rem;
  }
`

const StatLabel = styled.span`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: normal;

  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`

const StatValue = styled.span`
  font-size: 1.4rem;
  color: #ffffff;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`

const ProgressBar = styled.div`
  width: 100%;
  max-width: 200px;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
  margin-top: 0.5rem;

  @media (max-width: 768px) {
    max-width: 150px;
    height: 6px;
  }
`

const ProgressFill = styled.div<{ progress: number }>`
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #8BC34A);
  width: ${props => Math.min(100, Math.max(0, props.progress))}%;
  transition: width 0.3s ease;
  border-radius: 4px;
`

const ObjectivesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 150px;

  @media (max-width: 768px) {
    min-width: auto;
    width: 100%;
  }
`

const ObjectiveItem = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'completed'
}) <{ completed: boolean }>`
  font-size: 0.8rem;
  color: ${props => props.completed ? '#4CAF50' : 'rgba(255, 255, 255, 0.9)'};
  display: flex;
  align-items: center;
  gap: 0.25rem;

  .icon {
    font-size: 1rem;
  }

  @media (max-width: 768px) {
    font-size: 0.75rem;
    justify-content: center;
  }
`

const ComboIndicator = styled.div<{ combo: number }>`
  position: absolute;
  top: -2rem;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(45deg, #ff6b6b, #feca57);
  color: #ffffff;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: bold;
  font-size: 1rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  opacity: ${props => props.combo > 1 ? 1 : 0};
  transform: translateX(-50%) scale(${props => props.combo > 1 ? 1 : 0.8});
  transition: all 0.3s ease;
  z-index: 10;

  &::before {
    content: '🔥';
    margin-right: 0.5rem;
  }
`

const GameUI: React.FC = () => {
  const { score, level, moves, maxMoves, objectives, combo } = useAppSelector(state => state.game)
  const movesProgress = (moves / maxMoves) * 100

  return (
    <UIContainer>
      <ComboIndicator combo={combo}>
        {combo}x Combo!
      </ComboIndicator>

      <StatGroup>
        <StatLabel>💰 Score</StatLabel>
        <StatValue>{score.toLocaleString()}</StatValue>
      </StatGroup>

      <StatGroup>
        <StatLabel>📊 Level</StatLabel>
        <StatValue>{level}</StatValue>
      </StatGroup>

      <StatGroup>
        <StatLabel>🎯 Moves</StatLabel>
        <StatValue>{maxMoves - moves}</StatValue>
        <ProgressBar>
          <ProgressFill progress={100 - movesProgress} />
        </ProgressBar>
      </StatGroup>

      <ObjectivesList>
        {objectives.map(objective => (
          <ObjectiveItem key={objective.id} completed={objective.completed}>
            <span className="icon">
              {objective.completed ? '✅' : '⏳'}
            </span>
            <span>
              {objective.type === 'score'
                ? `${objective.current.toLocaleString()}/${objective.target.toLocaleString()}`
                : `${objective.current}/${objective.target}`
              }
            </span>
          </ObjectiveItem>
        ))}
      </ObjectivesList>
    </UIContainer>
  )
}

export default GameUI