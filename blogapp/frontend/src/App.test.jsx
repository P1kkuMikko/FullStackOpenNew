import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import App from './App';
import notificationReducer from './reducers/notificationReducer';
import blogReducer from './reducers/blogReducer';
import userReducer from './reducers/userReducer';

// Mock all the needed external modules with default exports
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

// Import the mocked modules
const blogService = await import('./services/blogs');

describe('App Component', () => {
  let store;

  const renderWithProviders = (preloadedState = {}) => {
    store = configureStore({
      reducer: {
        notification: notificationReducer,
        blogs: blogReducer,
        user: userReducer,
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

  const loggedInUser = {
    id: 'user1',
    name: 'User One',
    username: 'user1',
    token: 'fake-token',
  };

  beforeEach(() => {
    // Reset mocks for each test
    vi.resetAllMocks();

    // Mock localStorage
    const localStorageMock = (() => {
      let store = {};
      return {
        getItem: vi.fn(key => store[key] || null),
        setItem: vi.fn((key, value) => {
          store[key] = value.toString();
        }),
        removeItem: vi.fn(key => {
          delete store[key];
        }),
        clear: vi.fn(() => {
          store = {};
        }),
      };
    })();
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
    });
  });

  test('renders login form when user is not logged in', async () => {
    blogService.default.getAll.mockResolvedValue([]);

    renderWithProviders();

    // Should render the login form
    expect(screen.getByText('Log in to application')).toBeInTheDocument();
    expect(screen.getByText('login')).toBeInTheDocument();

    // Should not render blog list
    expect(screen.queryByText('blogs')).not.toBeInTheDocument();
  });

  test('renders blog list when user is logged in', async () => {
    blogService.default.getAll.mockResolvedValue(blogs);

    // Set up a logged-in user state
    const preloadedState = {
      user: loggedInUser,
      blogs: blogs,
    };

    renderWithProviders(preloadedState);

    // Wait for blogs to render, using more specific selectors
    await waitFor(() => {
      // Use heading role to select the h2 element with text "blogs"
      expect(
        screen.getByRole('heading', { name: 'blogs' })
      ).toBeInTheDocument();
      expect(screen.getByText('User One logged in')).toBeInTheDocument();
      expect(screen.getByText(/First test blog/)).toBeInTheDocument();
      expect(screen.getByText(/Second test blog/)).toBeInTheDocument();
    });

    // Should not render login form
    expect(screen.queryByText('Log in to application')).not.toBeInTheDocument();
  });

  test('blogs are sorted by likes in descending order', async () => {
    // Use blogs with clearly different number of likes
    const unsortedBlogs = [
      { ...blogs[0], likes: 3 },
      { ...blogs[1], likes: 10 },
    ];

    blogService.default.getAll.mockResolvedValue(unsortedBlogs);

    const preloadedState = {
      user: loggedInUser,
      blogs: unsortedBlogs,
    };

    renderWithProviders(preloadedState);

    await waitFor(() => {
      // We need to check that the blog with most likes appears first
      const renderedBlogs = screen.getAllByText(/Author/);
      expect(renderedBlogs[0].textContent).toContain('Author Two');
      expect(renderedBlogs[1].textContent).toContain('Author One');
    });
  });

  test('logout button clears user data', async () => {
    blogService.default.getAll.mockResolvedValue(blogs);

    const preloadedState = {
      user: loggedInUser,
      blogs: blogs,
    };

    renderWithProviders(preloadedState);

    // Find and click the logout button
    const logoutButton = screen.getByText('logout');
    fireEvent.click(logoutButton);

    // After logout, the login form should appear
    await waitFor(() => {
      expect(screen.getByText('Log in to application')).toBeInTheDocument();
      expect(screen.queryByText('User One logged in')).not.toBeInTheDocument();
    });
  });
});
