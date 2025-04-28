import { useContext } from 'react';
import NotificationContext from '../contexts/NotificationContext';

// Custom hooks for accessing the state and dispatch function
export const useNotificationValue = () => {
    const notificationAndDispatch = useContext(NotificationContext);
    return notificationAndDispatch[0];
};

export const useNotificationDispatch = () => {
    const notificationAndDispatch = useContext(NotificationContext);
    return notificationAndDispatch[1];
};