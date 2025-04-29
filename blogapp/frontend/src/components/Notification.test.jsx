import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { describe, test, expect } from 'vitest';
import Notification from './Notification';
import notificationReducer from '../reducers/notificationReducer';

describe('Notification Component', () => {
  let store;

  // Create a helper function for rendering with Redux Provider
  const renderWithProviders = (ui, initialState = {}) => {
    store = configureStore({
      reducer: {
        notification: notificationReducer,
      },
      preloadedState: initialState,
    });

    return render(<Provider store={store}>{ui}</Provider>);
  };

  test('renders nothing when notification message is empty', () => {
    const initialState = {
      notification: {
        message: '',
        type: null,
        timeoutId: null,
      },
    };

    renderWithProviders(<Notification />, initialState);

    // The component should return null, so no elements should be found
    const notificationElement = screen.queryByText(/./);
    expect(notificationElement).not.toBeInTheDocument();
  });

  test('renders success notification with green color', () => {
    const initialState = {
      notification: {
        message: 'This is a success message',
        type: 'success',
        timeoutId: null,
      },
    };

    const { container } = renderWithProviders(<Notification />, initialState);

    // Check that the message is displayed
    const notificationElement = screen.getByText('This is a success message');
    expect(notificationElement).toBeInTheDocument();

    // Check that it has the notification class
    const notificationDiv = container.querySelector('.notification');
    expect(notificationDiv).not.toBeNull();

    // Check the computed style - test RGB values instead of color names
    expect(notificationDiv.style.color).toBe('green');
  });

  test('renders error notification with red color', () => {
    const initialState = {
      notification: {
        message: 'This is an error message',
        type: 'error',
        timeoutId: null,
      },
    };

    const { container } = renderWithProviders(<Notification />, initialState);

    // Check that the message is displayed
    const notificationElement = screen.getByText('This is an error message');
    expect(notificationElement).toBeInTheDocument();

    // Check the computed style - test RGB values instead of color names
    const notificationDiv = container.querySelector('.notification');
    expect(notificationDiv.style.color).toBe('red');
  });
});
