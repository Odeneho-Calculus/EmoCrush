import React, { useEffect } from 'react'
import styled from 'styled-components'
import { useAppSelector } from '@/hooks/useAppSelector'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { removeNotification } from '@/store/slices/uiSlice'

const NotificationContainer = styled.div`
    position: fixed;
    top: 1rem;
    right: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    z-index: 2000;
    pointer-events: none;

    @media (max-width: 768px) {
        top: 0.5rem;
        right: 0.5rem;
        left: 0.5rem;
    }
`

const NotificationItem = styled.div<{ type: 'info' | 'success' | 'warning' | 'error' }>`
    padding: 1rem 1.5rem;
    border-radius: 10px;
    color: white;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px);
    pointer-events: auto;
    cursor: pointer;
    transition: all 0.3s ease;
    animation: slideIn 0.3s ease-out;
    max-width: 300px;

    background: ${props => {
        switch (props.type) {
            case 'success': return 'linear-gradient(45deg, #4CAF50, #45a049)'
            case 'warning': return 'linear-gradient(45deg, #ff9800, #f57c00)'
            case 'error': return 'linear-gradient(45deg, #f44336, #d32f2f)'
            default: return 'linear-gradient(45deg, #2196F3, #1976D2)'
        }
    }};

    &:hover {
        transform: translateX(-5px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
    }

    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @media (max-width: 768px) {
        padding: 0.8rem 1rem;
        font-size: 0.9rem;
        max-width: none;
    }
`

const NotificationIcon = styled.span`
    margin-right: 0.5rem;
    font-size: 1.2rem;
`

const NotificationMessage = styled.span`
    flex: 1;
`

const CloseButton = styled.button`
    background: none;
    border: none;
    color: white;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0;
    margin-left: 1rem;
    opacity: 0.7;
    transition: opacity 0.2s ease;

    &:hover {
        opacity: 1;
    }
`

const NotificationContent = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
`

const getNotificationIcon = (type: 'info' | 'success' | 'warning' | 'error'): string => {
    switch (type) {
        case 'success': return '✅'
        case 'warning': return '⚠️'
        case 'error': return '❌'
        default: return 'ℹ️'
    }
}

const NotificationSystem: React.FC = () => {
    const dispatch = useAppDispatch()
    const notifications = useAppSelector(state => state.ui.notifications)

    useEffect(() => {
        notifications.forEach(notification => {
            const timer = setTimeout(() => {
                dispatch(removeNotification(notification.id))
            }, notification.duration)

            return () => clearTimeout(timer)
        })
    }, [notifications, dispatch])

    const handleClose = (id: string) => {
        dispatch(removeNotification(id))
    }

    if (notifications.length === 0) {
        return null
    }

    return (
        <NotificationContainer>
            {notifications.map(notification => (
                <NotificationItem
                    key={notification.id}
                    type={notification.type}
                    onClick={() => handleClose(notification.id)}
                >
                    <NotificationContent>
                        <div>
                            <NotificationIcon>
                                {getNotificationIcon(notification.type)}
                            </NotificationIcon>
                            <NotificationMessage>
                                {notification.message}
                            </NotificationMessage>
                        </div>
                        <CloseButton onClick={(e) => {
                            e.stopPropagation()
                            handleClose(notification.id)
                        }}>
                            ×
                        </CloseButton>
                    </NotificationContent>
                </NotificationItem>
            ))}
        </NotificationContainer>
    )
}

export default NotificationSystem