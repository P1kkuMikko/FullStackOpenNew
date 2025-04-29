/* eslint-disable no-unused-vars */
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import Users from './Users';
import usersReducer, { setUsers } from '../reducers/usersReducer';

// Mock the initializeUsers function to avoid actually calling the thunk
vi.mock('../reducers/usersReducer', async importOriginal => {
  const actual = await importOriginal();
  return {
    ...actual,
    initializeUsers: vi.fn().mockImplementation(() => {
      return () => {};
    }),
  };
});

describe('Users Component', () => {
  let store;

  const renderWithProviders = (preloadedState = {}) => {
    store = configureStore({
      reducer: {
        users: usersReducer,
      },
      preloadedState,
    });

    return render(
      <Provider store={store}>
        <Users />
      </Provider>
    );
  };

  const users = [
    {
      id: 'user1',
      username: 'testuser1',
      name: 'Test User 1',
      blogs: [{ id: 'blog1' }, { id: 'blog2' }],
    },
    {
      id: 'user2',
      username: 'testuser2',
      name: 'Test User 2',
      blogs: [{ id: 'blog3' }],
    },
  ];

  test('renders the users heading', () => {
    renderWithProviders();

    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('blogs created')).toBeInTheDocument();
  });

  test('renders all users with their blog counts', () => {
    renderWithProviders({
      users: users,
    });

    // Check that user names are displayed
    expect(screen.getByText('Test User 1')).toBeInTheDocument();
    expect(screen.getByText('Test User 2')).toBeInTheDocument();

    // Check that blog counts are displayed correctly
    const rows = screen.getAllByRole('row');
    expect(rows.length).toBe(3); // Header row + 2 user rows

    // Find the row for Test User 1 and check blog count (2)
    const user1Row = rows.find(row => row.textContent.includes('Test User 1'));
    expect(user1Row).toBeDefined();
    expect(user1Row.textContent).toContain('2');

    // Find the row for Test User 2 and check blog count (1)
    const user2Row = rows.find(row => row.textContent.includes('Test User 2'));
    expect(user2Row).toBeDefined();
    expect(user2Row.textContent).toContain('1');
  });

  test('displays no users when the users array is empty', () => {
    renderWithProviders({
      users: [],
    });

    const rows = screen.queryAllByRole('row');
    expect(rows.length).toBe(1); // Only the header row
  });
});
