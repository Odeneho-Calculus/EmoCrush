import React from 'react'
import styled from 'styled-components'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { useAppSelector } from '@/hooks/useAppSelector'
import { resetGame } from '@/store/slices/gameSlice'
import { hideGameOver } from '@/store/slices/uiSlice'
import { updateHighScore } from '@/store/slices/playerSlice'

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
    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
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
    background: linear-gradient(45deg, #2196F3, #1976D2);

    &:hover {
        background: linear-gradient(45deg, #1976D2, #1565C0);
    }
`

const GameOverEmojis = styled.div`
    font-size: 3rem;
    animation: shake 1s infinite;

    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }

    @media (max-width: 768px) {
        font-size: 2rem;
    }
`

const EncouragementText = styled.p`
    font-size: 1.1rem;
    text-align: center;
    margin: 0;
    opacity: 0.9;
    font-style: italic;

    @media (max-width: 768px) {
        font-size: 1rem;
    }
`

const GameOverModal: React.FC = () => {
    const dispatch = useAppDispatch()
    const { score, level } = useAppSelector(state => state.game)
    const { highScore } = useAppSelector(state => state.player)

    const isNewHighScore = score > highScore
    const encouragementMessages = [
        "Don't give up! Every expert was once a beginner! 💪",
        "You're getting better with each game! 🌟",
        "Practice makes perfect! Try again! 🎯",
        "Great effort! You'll crush it next time! 🚀",
        "Keep going! Success is just around the corner! 🏆"
    ]
    const randomMessage = encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)]

    React.useEffect(() => {
        if (isNewHighScore) {
            dispatch(updateHighScore(score))
        }
    }, [dispatch, score, isNewHighScore])

    const handleTryAgain = () => {
        dispatch(hideGameOver())
        dispatch(resetGame())
    }

    const handleMainMenu = () => {
        dispatch(hideGameOver())
        dispatch(resetGame())
    }

    return (
        <ModalOverlay>
            <ModalContent>
                <GameOverEmojis>😔💔😢</GameOverEmojis>

                <ModalTitle>Game Over</ModalTitle>

                <EncouragementText>{randomMessage}</EncouragementText>

                <StatsContainer>
                    <StatRow>
                        <span className="label">📊 Level Reached:</span>
                        <span className="value">{level}</span>
                    </StatRow>
                    <StatRow>
                        <span className="label">💰 Final Score:</span>
                        <span className="value">{score.toLocaleString()}</span>
                    </StatRow>
                    <StatRow>
                        <span className="label">🏆 High Score:</span>
                        <span className="value">{Math.max(score, highScore).toLocaleString()}</span>
                    </StatRow>
                    {isNewHighScore && (
                        <StatRow>
                            <span className="label">🎉 New High Score!</span>
                            <span className="value">🌟</span>
                        </StatRow>
                    )}
                </StatsContainer>

                <ButtonGroup>
                    <ModalButton onClick={handleTryAgain}>
                        🔄 Try Again
                    </ModalButton>
                    <SecondaryButton onClick={handleMainMenu}>
                        🏠 Main Menu
                    </SecondaryButton>
                </ButtonGroup>
            </ModalContent>
        </ModalOverlay>
    )
}

export default GameOverModal