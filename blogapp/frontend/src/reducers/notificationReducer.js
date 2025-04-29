import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  message: '',
  type: null, // 'success' or 'error'
  timeoutId: null,
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setNotification(state, action) {
      const { message, type } = action.payload;
      return {
        ...state,
        message,
        type,
      };
    },
    clearNotification() {
      return initialState;
    },
    setTimeoutId(state, action) {
      return {
        ...state,
        timeoutId: action.payload,
      };
    },
  },
});

export const { setNotification, clearNotification, setTimeoutId } =
  notificationSlice.actions;

// Action creator for displaying notifications
export const showNotification = (message, type, seconds) => {
  return async (dispatch, getState) => {
    const { notification } = getState();

    // Clear previous timeout if exists
    if (notification.timeoutId) {
      clearTimeout(notification.timeoutId);
    }

    dispatch(setNotification({ message, type }));

    // Set new timeout
    const timeoutId = setTimeout(() => {
      dispatch(clearNotification());
    }, seconds * 1000);

    dispatch(setTimeoutId(timeoutId));
  };
};

export default notificationSlice.reducer;
