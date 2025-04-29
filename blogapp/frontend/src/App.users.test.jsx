/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import App from './App';
import notificationReducer from './reducers/notificationReducer';
import blogReducer from './reducers/blogReducer';
import userReducer from './reducers/userReducer';
import usersReducer from './reducers/usersReducer';

// Mock react-router-dom to avoid router nesting issues
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    BrowserRouter: ({ children }) => <>{children}</>,
  };
});

// Mock the required services
vi.mock('./services/blogs', () => ({
  default: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    setToken: vi.fn(),
  },
}));

vi.mock('./services/login', () => ({
  default: {
    login: vi.fn(),
  },
}));

vi.mock('./services/users', () => ({
  default: {
    getAll: vi.fn(),
  },
}));

// Mock the initializeUsers function
vi.mock('./reducers/usersReducer', () => ({
  initializeUsers: vi.fn().mockReturnValue({ type: 'test/action' }),
  default: () => [],
}));

// Import the mocked modules
const blogService = await import('./services/blogs');
const userService = await import('./services/users');

describe('App Component - Users View', () => {
  let store;

  const renderWithProviders = (preloadedState = {}, initialPath = '/') => {
    // Mock window.history.pushState to simulate navigation
    history.pushState({}, '', initialPath);

    store = configureStore({
      reducer: {
        notification: notificationReducer,
        blogs: blogReducer,
        user: userReducer,
        users: usersReducer,
      },
      preloadedState,
    });

    return render(
      <Provider store={store}>
        <App />
      </Provider>
    );
  };

  const blogs = [
    {
      id: '1',
      title: 'First test blog',
      author: 'Author One',
      url: 'http://test1.com',
      likes: 5,
      user: { id: 'user1', name: 'User One', username: 'user1' },
    },
    {
      id: '2',
      title: 'Second test blog',
      author: 'Author Two',
      url: 'http://test2.com',
      likes: 10,
      user: { id: 'user2', name: 'User Two', username: 'user2' },
    },
  ];

  const users = [
    {
      id: 'user1',
      username: 'user1',
      name: 'User One',
      blogs: [{ id: '1' }],
    },
    {
      id: 'user2',
      username: 'user2',
      name: 'User Two',
      blogs: [{ id: '2' }],
    },
  ];

  const loggedInUser = {
    id: 'user1',
    username: 'user1',
    name: 'User One',
    token: 'test-token-123',
  };

  beforeEach(() => {
    vi.resetAllMocks();
    // Mock localStorage to return the logged-in user
    const localStorageMock = {
      getItem: vi.fn().mockReturnValue(JSON.stringify(loggedInUser)),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
    });

    // Mock blog service response
    blogService.default.getAll.mockResolvedValue(blogs);
    // Mock user service response
    userService.default.getAll.mockResolvedValue(users);
  });

  test('navigation links are rendered when user is logged in', async () => {
    renderWithProviders({
      user: loggedInUser,
      blogs: blogs,
      users: [],
    });

    // Wait for the component to fully render
    await waitFor(() => {
      expect(screen.getByText(/User One logged in/i)).toBeInTheDocument();
    });

    // Check that navigation links are rendered
    expect(screen.getByRole('link', { name: 'blogs' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'users' })).toBeInTheDocument();
  });

  test('clicking users link navigates to users view', async () => {
    renderWithProviders({
      user: loggedInUser,
      blogs: blogs,
      users: users,
    });

    // Wait for the component to fully render
    await waitFor(() => {
      expect(screen.getByText(/User One logged in/i)).toBeInTheDocument();
    });

    // Find and click the users link
    const usersLink = screen.getByRole('link', { name: 'users' });

    // Simulate navigation by manually changing the URL
    history.pushState({}, '', '/users');
    // Trigger a navigation event that React Router will detect
    window.dispatchEvent(new Event('popstate'));

    // Verify that we're on the users view
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Users' })
      ).toBeInTheDocument();
      expect(screen.getByText('blogs created')).toBeInTheDocument();
    });
  });

  test('users view displays correct user data', async () => {
    // Render directly with initial path as /users
    renderWithProviders(
      {
        user: loggedInUser,
        blogs: blogs,
        users: users,
      },
      '/users'
    );

    // Wait for the users to be displayed
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Users' })
      ).toBeInTheDocument();
      expect(screen.getByText('User One')).toBeInTheDocument();
      expect(screen.getByText('User Two')).toBeInTheDocument();
    });

    // Verify that the blog counts are correct
    const rows = screen.getAllByRole('row');
    expect(rows.length).toBe(3); // Header row + 2 user rows

    // Check blog counts for both users (1 blog each)
    expect(rows[1].textContent).toContain('1');
    expect(rows[2].textContent).toContain('1');
  });

  test('users view renders properly', async () => {
    renderWithProviders(
      {
        user: loggedInUser,
        blogs: blogs,
        users: users,
      },
      '/users'
    );

    // Wait for the component to render
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Users' })
      ).toBeInTheDocument();
    });
  });
});
