import { createSlice } from '@reduxjs/toolkit';
import loginService from '../services/login';
import blogService from '../services/blogs';
import { showNotification } from './notificationReducer';

const userSlice = createSlice({
  name: 'user',
  initialState: null,
  reducers: {
    setUser(state, action) {
      return action.payload;
    },
    clearUser() {
      return null;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;

// Action creator for logging in
export const login = credentials => {
  return async dispatch => {
    try {
      const user = await loginService.login(credentials);

      // Save token to browser local storage
      window.localStorage.setItem('loggedBlogappUser', JSON.stringify(user));

      // Set token for blog service
      blogService.setToken(user.token);

      dispatch(setUser(user));

      // Show success notification
      dispatch(showNotification(`Welcome ${user.name}`, 'success', 5));

      return user;
    } catch (error) {
      dispatch(showNotification('Wrong username or password', 'error', 5));
      throw error;
    }
  };
};

// Action creator for logging out
export const logout = () => {
  return async dispatch => {
    // Remove user from local storage
    window.localStorage.removeItem('loggedBlogappUser');

    // Clear token from blog service
    blogService.setToken(null);

    // Clear user from Redux store
    dispatch(clearUser());

    // Show logout notification
    dispatch(showNotification('Logged out successfully', 'success', 5));
  };
};

// Action creator for setting user from local storage
export const initializeUser = () => {
  return async dispatch => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser');

    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON);
      dispatch(setUser(user));
      blogService.setToken(user.token);
    }
  };
};

export default userSlice.reducer;
