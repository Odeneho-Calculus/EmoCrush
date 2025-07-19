import React from 'react'
import styled from 'styled-components'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { useAppSelector } from '@/hooks/useAppSelector'
import { hideSettings } from '@/store/slices/uiSlice'
import {
    toggleSound,
    toggleMusic,
    setSoundVolume,
    setMusicVolume,
    toggleVibration,
    toggleHints,
    setAnimationSpeed
} from '@/store/slices/playerSlice'

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
    gap: 1.5rem;
    min-width: 400px;
    max-width: 500px;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.3);

    @media (max-width: 768px) {
        min-width: 320px;
        padding: 1.5rem;
        gap: 1rem;
        max-height: 90vh;
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

const SettingGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.05);
    border-radius: 15px;
`

const SettingRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: stretch;
        gap: 0.5rem;
    }
`

const SettingLabel = styled.label`
    font-size: 1.1rem;
    color: #333;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    @media (max-width: 768px) {
        font-size: 1rem;
    }
`

const Toggle = styled.button<{ active: boolean }>`
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 25px;
    cursor: pointer;
    font-weight: bold;
    transition: all 0.3s ease;
    background: ${props => props.active
        ? 'linear-gradient(45deg, #4CAF50, #45a049)'
        : 'linear-gradient(45deg, #f44336, #d32f2f)'};
    color: white;
    min-width: 80px;

    &:hover {
        transform: scale(1.05);
    }

    @media (max-width: 768px) {
        padding: 0.4rem 0.8rem;
        font-size: 0.9rem;
    }
`

const Slider = styled.input`
    width: 150px;
    height: 6px;
    border-radius: 3px;
    background: #ddd;
    outline: none;
    -webkit-appearance: none;

    &::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: linear-gradient(45deg, #4CAF50, #45a049);
        cursor: pointer;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    }

    &::-moz-range-thumb {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: linear-gradient(45deg, #4CAF50, #45a049);
        cursor: pointer;
        border: none;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    }

    @media (max-width: 768px) {
        width: 100%;
    }
`



const StyledLabel = styled.label`
    font-size: 1.1rem;
    color: #333;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    @media (max-width: 768px) {
        font-size: 1rem;
    }
`

const SelectContainer = styled.div`
    select {
        padding: 0.5rem 1rem;
        border: 2px solid #ddd;
        border-radius: 10px;
        background: white;
        font-size: 1rem;
        cursor: pointer;
        outline: none;
        transition: border-color 0.3s ease;

        &:focus {
            border-color: #4CAF50;
            box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
        }

        &:hover {
            border-color: #999;
        }

        @media (max-width: 768px) {
            width: 100%;
            padding: 0.4rem 0.8rem;
            font-size: 0.9rem;
        }
    }
`



const VolumeContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;

    @media (max-width: 768px) {
        flex-direction: column;
        gap: 0.5rem;
    }
`

const VolumeValue = styled.span`
    font-weight: bold;
    color: #4CAF50;
    min-width: 40px;
    text-align: center;

    @media (max-width: 768px) {
        min-width: auto;
    }
`

const CloseButton = styled.button`
    padding: 1rem 2rem;
    font-size: 1.1rem;
    font-weight: bold;
    color: #ffffff;
    background: linear-gradient(45deg, #2196F3, #1976D2);
    border: none;
    border-radius: 50px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    align-self: center;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
        background: linear-gradient(45deg, #1976D2, #1565C0);
    }

    &:active {
        transform: translateY(0);
    }

    @media (max-width: 768px) {
        padding: 0.8rem 1.5rem;
        font-size: 1rem;
        width: 100%;
    }
`

const SettingsModal: React.FC = () => {
    const dispatch = useAppDispatch()
    const settings = useAppSelector(state => state.player.settings)

    const handleClose = () => {
        dispatch(hideSettings())
    }

    const handleSoundVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(setSoundVolume(parseFloat(e.target.value)))
    }

    const handleMusicVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(setMusicVolume(parseFloat(e.target.value)))
    }

    const handleAnimationSpeedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        dispatch(setAnimationSpeed(e.target.value as 'slow' | 'normal' | 'fast'))
    }

    return (
        <ModalOverlay
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-modal-title"
            onClick={handleClose}
        >
            <ModalContent onClick={(e) => e.stopPropagation()}>
                <ModalTitle id="settings-modal-title">⚙️ Settings</ModalTitle>

                <SettingGroup>
                    <SettingRow>
                        <SettingLabel>🔊 Sound Effects</SettingLabel>
                        <Toggle
                            active={settings.soundEnabled}
                            onClick={() => dispatch(toggleSound())}
                            aria-label="Toggle sound effects"
                            aria-pressed={settings.soundEnabled}
                            title={`Turn sound effects ${settings.soundEnabled ? 'off' : 'on'}`}
                            role="switch"
                        >
                            {settings.soundEnabled ? 'ON' : 'OFF'}
                        </Toggle>
                    </SettingRow>

                    {settings.soundEnabled && (
                        <SettingRow>
                            <StyledLabel htmlFor="sound-volume-slider">🔊 Sound Volume</StyledLabel>
                            <VolumeContainer>
                                <Slider
                                    id="sound-volume-slider"
                                    name="sound-volume"
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={settings.soundVolume}
                                    onChange={handleSoundVolumeChange}
                                    aria-label="Sound Volume"
                                    aria-valuemin={0}
                                    aria-valuemax={1}
                                    aria-valuenow={settings.soundVolume}
                                    aria-valuetext={`${Math.round(settings.soundVolume * 100)}%`}
                                    title="Adjust sound effects volume"
                                    role="slider"
                                />
                                <VolumeValue>{Math.round(settings.soundVolume * 100)}%</VolumeValue>
                            </VolumeContainer>
                        </SettingRow>
                    )}
                </SettingGroup>

                <SettingGroup>
                    <SettingRow>
                        <SettingLabel>🎵 Background Music</SettingLabel>
                        <Toggle
                            active={settings.musicEnabled}
                            onClick={() => dispatch(toggleMusic())}
                            aria-label="Toggle background music"
                            aria-pressed={settings.musicEnabled}
                            title={`Turn background music ${settings.musicEnabled ? 'off' : 'on'}`}
                            role="switch"
                        >
                            {settings.musicEnabled ? 'ON' : 'OFF'}
                        </Toggle>
                    </SettingRow>

                    {settings.musicEnabled && (
                        <SettingRow>
                            <StyledLabel htmlFor="music-volume-slider">🎵 Music Volume</StyledLabel>
                            <VolumeContainer>
                                <Slider
                                    id="music-volume-slider"
                                    name="music-volume"
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={settings.musicVolume}
                                    onChange={handleMusicVolumeChange}
                                    aria-label="Music Volume"
                                    aria-valuemin={0}
                                    aria-valuemax={1}
                                    aria-valuenow={settings.musicVolume}
                                    aria-valuetext={`${Math.round(settings.musicVolume * 100)}%`}
                                    title="Adjust background music volume"
                                    role="slider"
                                />
                                <VolumeValue>{Math.round(settings.musicVolume * 100)}%</VolumeValue>
                            </VolumeContainer>
                        </SettingRow>
                    )}
                </SettingGroup>

                <SettingGroup>
                    <SettingRow>
                        <SettingLabel>📱 Vibration</SettingLabel>
                        <Toggle
                            active={settings.vibrationEnabled}
                            onClick={() => dispatch(toggleVibration())}
                            aria-label="Toggle vibration feedback"
                            aria-pressed={settings.vibrationEnabled}
                            title={`Turn vibration feedback ${settings.vibrationEnabled ? 'off' : 'on'}`}
                            role="switch"
                        >
                            {settings.vibrationEnabled ? 'ON' : 'OFF'}
                        </Toggle>
                    </SettingRow>

                    <SettingRow>
                        <SettingLabel>💡 Show Hints</SettingLabel>
                        <Toggle
                            active={settings.showHints}
                            onClick={() => dispatch(toggleHints())}
                            aria-label="Toggle gameplay hints"
                            aria-pressed={settings.showHints}
                            title={`Turn gameplay hints ${settings.showHints ? 'off' : 'on'}`}
                            role="switch"
                        >
                            {settings.showHints ? 'ON' : 'OFF'}
                        </Toggle>
                    </SettingRow>

                    <SettingRow>
                        <StyledLabel htmlFor="animation-speed-select" id="animation-speed-label">⚡ Animation Speed</StyledLabel>
                        <SelectContainer>
                            <select
                                id="animation-speed-select"
                                name="animation-speed"
                                value={settings.animationSpeed}
                                onChange={handleAnimationSpeedChange}
                                aria-labelledby="animation-speed-label"
                                title="Select animation speed for game animations"
                            >
                                <option value="slow">🐌 Slow</option>
                                <option value="normal">🚶 Normal</option>
                                <option value="fast">🏃 Fast</option>
                            </select>
                        </SelectContainer>
                    </SettingRow>
                </SettingGroup>

                <CloseButton
                    onClick={handleClose}
                    aria-label="Save settings and close modal"
                    title="Save all settings and close the settings modal"
                >
                    ✅ Save Settings
                </CloseButton>
            </ModalContent>
        </ModalOverlay>
    )
}

export default SettingsModal