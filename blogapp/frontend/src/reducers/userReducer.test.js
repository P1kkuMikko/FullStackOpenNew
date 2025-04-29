import { describe, test, expect, vi, beforeEach } from 'vitest';
import userReducer, {
  setUser,
  clearUser,
  login,
  logout,
  initializeUser
} from './userReducer';

// Proper mocking of services with default exports
vi.mock('../services/login', () => ({
  default: {
    login: vi.fn()
  }
}));

vi.mock('../services/blogs', () => ({
  default: {
    setToken: vi.fn()
  }
}));

// Fix the mock implementation to match the actual usage in userReducer.js
vi.mock('./notificationReducer', () => ({
  showNotification: (message, type, duration) => {
    if (type === 'error') {
      return {
        type: 'notification/showNotification',
        payload: { message, type, duration },
        isErrorNotification: true
      };
    } else {
      return {
        type: 'notification/showNotification',
        payload: { message, type, duration }
      };
    }
  }
}));

const loginService = await import('../services/login');
const blogService = await import('../services/blogs');

describe('userReducer', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.resetAllMocks();
  });

  test('returns null as initial state', () => {
    const action = { type: 'UNKNOWN_ACTION' };
    const newState = userReducer(undefined, action);
    expect(newState).toBeNull();
  });

  test('setUser action sets the user state', () => {
    const user = {
      username: 'testuser',
      name: 'Test User',
      token: 'test-token-123'
    };

    const action = setUser(user);
    const newState = userReducer(null, action);
    expect(newState).toEqual(user);
  });

  test('clearUser action resets the state to null', () => {
    const initialState = {
      username: 'testuser',
      name: 'Test User',
      token: 'test-token-123'
    };

    const action = clearUser();
    const newState = userReducer(initialState, action);
    expect(newState).toBeNull();
  });

  test('login thunk sets user to localStorage on successful login', async () => {
    const credentials = {
      username: 'testuser',
      password: 'password123'
    };

    const user = {
      username: 'testuser',
      name: 'Test User',
      token: 'test-token-123'
    };

    loginService.default.login.mockResolvedValue(user);

    const dispatch = vi.fn();

    await login(credentials)(dispatch);

    // Verify login service was called with credentials
    expect(loginService.default.login).toHaveBeenCalledWith(credentials);

    // Verify blog service token was set
    expect(blogService.default.setToken).toHaveBeenCalledWith(user.token);

    // Verify user was stored in localStorage with consistent key
    const storedUser = JSON.parse(localStorage.getItem('loggedBlogappUser'));
    expect(storedUser).toEqual(user);

    // Verify setUser action was dispatched
    const setUserAction = dispatch.mock.calls.find(
      call => call[0].type === 'user/setUser'
    );
    expect(setUserAction[0].payload).toEqual(user);

    // Verify notification was shown
    const notificationAction = dispatch.mock.calls.find(
      call => call[0].type === 'notification/showNotification'
    );
    expect(notificationAction).toBeTruthy();
  });

  test('login thunk handles login failure', async () => {
    const credentials = {
      username: 'testuser',
      password: 'wrongpassword'
    };

    const error = new Error('Invalid credentials');
    loginService.default.login.mockRejectedValue(error);

    const dispatch = vi.fn();

    // Test that the promise rejection is properly handled
    await expect(login(credentials)(dispatch)).rejects.toThrow();

    // Check if error notification was dispatched
    const errorActions = dispatch.mock.calls.filter(
      call => call[0].type === 'notification/showNotification'
    );

    expect(errorActions.length).toBeGreaterThan(0);

    // At least one of the notification calls should be an error notification
    const hasErrorNotification = errorActions.some(call => call[0].isErrorNotification);
    expect(hasErrorNotification).toBe(true);

    // Verify user was NOT stored in localStorage
    const storedUser = localStorage.getItem('loggedBlogappUser');
    expect(storedUser).toBeNull();
  });

  test('logout thunk clears user from localStorage and state', async () => {
    // Setup user in localStorage with consistent key
    const user = {
      username: 'testuser',
      name: 'Test User',
      token: 'test-token-123'
    };
    localStorage.setItem('loggedBlogappUser', JSON.stringify(user));

    const dispatch = vi.fn();

    await logout()(dispatch);

    // Verify localStorage was cleared
    expect(localStorage.getItem('loggedBlogappUser')).toBeNull();

    // Verify token was cleared
    expect(blogService.default.setToken).toHaveBeenCalledWith(null);

    // Verify clearUser action was dispatched
    expect(dispatch).toHaveBeenCalledWith(clearUser());

    // Verify notification was shown
    const notificationAction = dispatch.mock.calls.find(
      call => call[0].type === 'notification/showNotification'
    );
    expect(notificationAction).toBeTruthy();
  });

  test('initializeUser thunk loads user from localStorage', async () => {
    // Setup user in localStorage with consistent key
    const user = {
      username: 'testuser',
      name: 'Test User',
      token: 'test-token-123'
    };
    localStorage.setItem('loggedBlogappUser', JSON.stringify(user));

    const dispatch = vi.fn();

    await initializeUser()(dispatch);

    // Verify token was set
    expect(blogService.default.setToken).toHaveBeenCalledWith(user.token);

    // Verify setUser was called with user from localStorage
    expect(dispatch).toHaveBeenCalledWith(setUser(user));
  });

  test('initializeUser thunk does nothing when localStorage is empty', async () => {
    const dispatch = vi.fn();

    await initializeUser()(dispatch);

    // Verify token was NOT set
    expect(blogService.default.setToken).not.toHaveBeenCalled();

    // Verify setUser was NOT called
    expect(dispatch).not.toHaveBeenCalled();
  });
});