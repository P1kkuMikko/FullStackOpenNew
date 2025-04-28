import { createSlice } from '@reduxjs/toolkit';

const notificationSlice = createSlice({
    name: 'notification',
    initialState: null,
    reducers: {
        setNotification(state, action) {
            return action.payload;
        },
        clearNotification() {
            return null;
        }
    }
});

export const { setNotification, clearNotification } = notificationSlice.actions;

// Action creator for showing a notification for a specific duration
export const showNotification = (message, seconds) => {
    return async dispatch => {
        dispatch(setNotification(message));

        // Clear any existing timeout
        if (window.notificationTimeout) {
            clearTimeout(window.notificationTimeout);
        }

        // Set a new timeout
        window.notificationTimeout = setTimeout(() => {
            dispatch(clearNotification());
        }, seconds * 1000);
    };
};

export default notificationSlice.reducer;