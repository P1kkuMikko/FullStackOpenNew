import { describe, test, expect, vi, beforeEach } from 'vitest';
import notificationReducer, {
  setNotification,
  clearNotification,
  setTimeoutId,
  showNotification
} from './notificationReducer';

describe('notificationReducer', () => {
  let initialState;

  beforeEach(() => {
    initialState = {
      message: '',
      type: null,
      timeoutId: null
    };
    vi.resetAllMocks();
  });

  test('returns proper initial state when initialized with undefined state', () => {
    const action = { type: 'DO_NOTHING' };
    const newState = notificationReducer(undefined, action);
    expect(newState).toEqual(initialState);
  });

  test('setNotification action updates message and type', () => {
    const action = setNotification({ message: 'Test notification', type: 'success' });
    const newState = notificationReducer(initialState, action);

    expect(newState.message).toBe('Test notification');
    expect(newState.type).toBe('success');
    expect(newState.timeoutId).toBe(null);
  });

  test('clearNotification action resets state', () => {
    const modifiedState = {
      message: 'Current notification',
      type: 'success',
      timeoutId: 123
    };

    const action = clearNotification();
    const newState = notificationReducer(modifiedState, action);

    expect(newState).toEqual(initialState);
  });

  test('setTimeoutId action updates timeoutId', () => {
    const timeoutId = 12345;
    const action = setTimeoutId(timeoutId);
    const newState = notificationReducer(initialState, action);

    expect(newState.timeoutId).toBe(timeoutId);
    expect(newState.message).toBe('');
    expect(newState.type).toBe(null);
  });

  test('showNotification dispatches actions and sets timeout', async () => {
    // Mock timeout
    vi.useFakeTimers();

    // Mock dispatch and getState
    const dispatch = vi.fn();
    const getState = vi.fn().mockReturnValue({
      notification: { timeoutId: null }
    });

    // Capture the timeout callback
    let timeoutCallback;
    const originalSetTimeout = globalThis.setTimeout;
    globalThis.setTimeout = vi.fn((callback) => {
      timeoutCallback = callback;
      return 123; // Mock timeout ID
    });

    // Call the thunk
    await showNotification('Test message', 'success', 5)(dispatch, getState);

    // Verify first dispatch (setNotification)
    expect(dispatch).toHaveBeenCalledWith(
      setNotification({ message: 'Test message', type: 'success' })
    );

    // Verify setTimeout was called correctly
    expect(setTimeout).toHaveBeenCalled();

    // Verify the timeoutId was set
    expect(dispatch).toHaveBeenCalledWith(setTimeoutId(123));

    // Manually invoke the captured timeout callback instead of using vi.runAllTimers()
    if (timeoutCallback) {
      timeoutCallback();
    }

    // Now verify that clearNotification was called
    expect(dispatch).toHaveBeenCalledWith(clearNotification());

    // Restore original setTimeout
    globalThis.setTimeout = originalSetTimeout;
    vi.useRealTimers();
  });

  test('showNotification clears previous timeout if it exists', async () => {
    vi.useFakeTimers();

    const previousTimeoutId = 12345;
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');

    // Mock dispatch and getState with existing timeoutId
    const dispatch = vi.fn();
    const getState = vi.fn().mockReturnValue({
      notification: { timeoutId: previousTimeoutId }
    });

    // Call the thunk
    await showNotification('New message', 'error', 3)(dispatch, getState);

    // Verify clearTimeout was called with previous timeoutId
    expect(clearTimeoutSpy).toHaveBeenCalledWith(previousTimeoutId);

    // Cleanup
    clearTimeoutSpy.mockRestore();
    vi.useRealTimers();
  });
});