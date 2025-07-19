import React from 'react'
import styled from 'styled-components'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { resumeGame, endGame } from '@/store/slices/gameSlice'
import { hidePauseMenu, showSettings } from '@/store/slices/uiSlice'

const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(5px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
`

const ModalContent = styled.div`
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border-radius: 20px;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    min-width: 300px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.3);

    @media (max-width: 768px) {
        min-width: 280px;
        padding: 1.5rem;
        gap: 1rem;
    }
`

const ModalTitle = styled.h2`
    font-size: 2rem;
    color: #333;
    margin: 0;
    text-align: center;
    font-weight: bold;

    @media (max-width: 768px) {
        font-size: 1.5rem;
    }
`

const ButtonGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
`

const ModalButton = styled.button`
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

const DangerButton = styled(ModalButton)`
    background: linear-gradient(45deg, #f44336, #d32f2f);

    &:hover {
        background: linear-gradient(45deg, #d32f2f, #c62828);
    }
`

const PauseMenu: React.FC = () => {
    const dispatch = useAppDispatch()

    const handleResume = () => {
        dispatch(hidePauseMenu())
        dispatch(resumeGame())
    }

    const handleSettings = () => {
        dispatch(showSettings())
    }

    const handleQuit = () => {
        dispatch(hidePauseMenu())
        dispatch(endGame('game_over'))
    }

    return (
        <ModalOverlay>
            <ModalContent>
                <ModalTitle>⏸️ Game Paused</ModalTitle>

                <ButtonGroup>
                    <ModalButton onClick={handleResume}>
                        ▶️ Resume Game
                    </ModalButton>

                    <SecondaryButton onClick={handleSettings}>
                        ⚙️ Settings
                    </SecondaryButton>

                    <DangerButton onClick={handleQuit}>
                        🏠 Quit to Menu
                    </DangerButton>
                </ButtonGroup>
            </ModalContent>
        </ModalOverlay>
    )
}

export default PauseMenu