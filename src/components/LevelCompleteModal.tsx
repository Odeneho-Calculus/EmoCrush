import React from 'react'
import styled from 'styled-components'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { useAppSelector } from '@/hooks/useAppSelector'
import { nextLevel, endGame } from '@/store/slices/gameSlice'
import { hideLevelComplete } from '@/store/slices/uiSlice'
import { completeLevel } from '@/store/slices/playerSlice'

const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(5px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
`

const ModalContent = styled.div`
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 20px;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    min-width: 350px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
    border: 2px solid rgba(255, 255, 255, 0.3);
    color: white;

    @media (max-width: 768px) {
        min-width: 300px;
        padding: 1.5rem;
        gap: 1rem;
    }
`

const ModalTitle = styled.h2`
    font-size: 2.5rem;
    margin: 0;
    text-align: center;
    font-weight: bold;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);

    @media (max-width: 768px) {
        font-size: 2rem;
    }
`

const StatsContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    background: rgba(255, 255, 255, 0.1);
    padding: 1.5rem;
    border-radius: 15px;
    backdrop-filter: blur(10px);
`

const StatRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 1.1rem;

    .label {
        font-weight: normal;
    }

    .value {
        font-weight: bold;
        color: #ffd700;
        font-size: 1.2rem;
    }

    @media (max-width: 768px) {
        font-size: 1rem;

        .value {
            font-size: 1.1rem;
        }
    }
`

const ButtonGroup = styled.div`
    display: flex;
    gap: 1rem;
    width: 100%;

    @media (max-width: 768px) {
        flex-direction: column;
    }
`

const ModalButton = styled.button`
    flex: 1;
    padding: 1rem 2rem;
    font-size: 1.1rem;
    font-weight: bold;
    color: #ffffff;
    background: linear-gradient(45deg, #4CAF50, #45a049);
    border: none;
    border-radius: 50px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
        background: linear-gradient(45deg, #45a049, #3d8b40);
    }

    &:active {
        transform: translateY(0);
    }

    @media (max-width: 768px) {
        padding: 0.8rem 1.5rem;
        font-size: 1rem;
    }
`

const SecondaryButton = styled(ModalButton)`
    background: linear-gradient(45deg, #ff6b6b, #ee5a24);

    &:hover {
        background: linear-gradient(45deg, #ee5a24, #d63031);
    }
`

const CelebrationEmojis = styled.div`
    font-size: 3rem;
    animation: celebration 2s infinite;

    @keyframes celebration {
        0%, 100% { transform: scale(1) rotate(0deg); }
        25% { transform: scale(1.1) rotate(-5deg); }
        75% { transform: scale(1.1) rotate(5deg); }
    }

    @media (max-width: 768px) {
        font-size: 2rem;
    }
`

const LevelCompleteModal: React.FC = () => {
    const dispatch = useAppDispatch()
    const { score, level, moves, maxMoves } = useAppSelector(state => state.game)
    const { highScore } = useAppSelector(state => state.player)

    const isNewHighScore = score > highScore
    const movesLeft = maxMoves - moves
    const bonusScore = movesLeft * 100

    const handleNextLevel = () => {
        dispatch(completeLevel({ level, score }))
        dispatch(hideLevelComplete())
        dispatch(nextLevel())
    }

    const handleQuit = () => {
        dispatch(completeLevel({ level, score }))
        dispatch(hideLevelComplete())
        dispatch(endGame('game_over'))
    }

    return (
        <ModalOverlay>
            <ModalContent>
                <CelebrationEmojis>🎉🏆🎊</CelebrationEmojis>

                <ModalTitle>Level Complete!</ModalTitle>

                <StatsContainer>
                    <StatRow>
                        <span className="label">📊 Level:</span>
                        <span className="value">{level}</span>
                    </StatRow>
                    <StatRow>
                        <span className="label">💰 Score:</span>
                        <span className="value">{score.toLocaleString()}</span>
                    </StatRow>
                    <StatRow>
                        <span className="label">🎯 Moves Left:</span>
                        <span className="value">{movesLeft}</span>
                    </StatRow>
                    <StatRow>
                        <span className="label">🎁 Bonus:</span>
                        <span className="value">+{bonusScore.toLocaleString()}</span>
                    </StatRow>
                    {isNewHighScore && (
                        <StatRow>
                            <span className="label">🏆 New High Score!</span>
                            <span className="value">🌟</span>
                        </StatRow>
                    )}
                </StatsContainer>

                <ButtonGroup>
                    <ModalButton onClick={handleNextLevel}>
                        🚀 Next Level
                    </ModalButton>
                    <SecondaryButton onClick={handleQuit}>
                        🏠 Main Menu
                    </SecondaryButton>
                </ButtonGroup>
            </ModalContent>
        </ModalOverlay>
    )
}

export default LevelCompleteModal