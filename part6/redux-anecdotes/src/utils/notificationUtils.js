// Helper function to show notification for a specific duration
export const showNotification = (dispatch, message, seconds) => {
    dispatch({
        type: 'SET_NOTIFICATION',
        payload: message,
    });

    // Clear any existing timeout to prevent multiple timers
    if (window.notificationTimeout) {
        clearTimeout(window.notificationTimeout);
    }

    window.notificationTimeout = setTimeout(() => {
        dispatch({
            type: 'CLEAR_NOTIFICATION',
        });
    }, seconds * 1000);
};