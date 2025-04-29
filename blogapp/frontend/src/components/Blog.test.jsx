import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Blog from './Blog';
import blogReducer from '../reducers/blogReducer';

// Create a mock for the Redux dispatch function
const mockDispatch = vi.fn();

// Mock the useDispatch hook
vi.mock('react-redux', async () => {
  const actual = await vi.importActual('react-redux');
  return {
    ...actual,
    useDispatch: () => mockDispatch,
  };
});

describe('Blog component', () => {
  const blog = {
    id: '12345',
    title: 'Test Blog Title',
    author: 'Test Author',
    url: 'https://testblog.com',
    likes: 10,
    user: {
      id: 'user123',
      name: 'User Name',
      username: 'username',
    },
  };

  const currentUser = {
    id: 'user123',
    name: 'User Name',
    username: 'username',
  };

  const mockUpdateBlogs = vi.fn();
  const mockHandleDelete = vi.fn();

  // Create a Redux store for testing
  const renderWithRedux = component => {
    const store = configureStore({
      reducer: {
        blogs: blogReducer,
      },
    });

    return render(<Provider store={store}>{component}</Provider>);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders blog title and author but not URL or likes by default', () => {
    renderWithRedux(
      <Blog
        blog={blog}
        updateBlogs={mockUpdateBlogs}
        handleDelete={mockHandleDelete}
        currentUser={currentUser}
      />
    );

    // Title and author are visible
    expect(screen.getByText(/Test Blog Title/)).toBeInTheDocument();
    expect(screen.getByText(/Test Author/)).toBeInTheDocument();

    // URL and likes are not initially visible
    expect(screen.queryByText('https://testblog.com')).not.toBeInTheDocument();
    expect(screen.queryByText(/likes/)).not.toBeInTheDocument();
  });

  test('shows URL and likes when view button is clicked', () => {
    renderWithRedux(
      <Blog
        blog={blog}
        updateBlogs={mockUpdateBlogs}
        handleDelete={mockHandleDelete}
        currentUser={currentUser}
      />
    );

    // Click the view button
    const viewButton = screen.getByText('view');
    fireEvent.click(viewButton);

    // Now URL and likes should be visible
    expect(screen.getByText('https://testblog.com')).toBeInTheDocument();
    expect(screen.getByText(/likes 10/)).toBeInTheDocument();

    // Button should now say "hide"
    expect(screen.getByText('hide')).toBeInTheDocument();
  });

  test('clicking the like button twice calls the event handler twice', () => {
    renderWithRedux(
      <Blog
        blog={blog}
        updateBlogs={mockUpdateBlogs}
        handleDelete={mockHandleDelete}
        currentUser={currentUser}
      />
    );

    // First make details visible
    const viewButton = screen.getByText('view');
    fireEvent.click(viewButton);

    // Find like button and click it twice
    const likeButton = screen.getByText('like');
    fireEvent.click(likeButton);
    fireEvent.click(likeButton);

    // Assert dispatch was called twice
    expect(mockDispatch).toHaveBeenCalledTimes(2);
  });

  test('shows delete button only for blog creator', () => {
    // First render with the creator user
    const { unmount } = renderWithRedux(
      <Blog
        blog={blog}
        updateBlogs={mockUpdateBlogs}
        handleDelete={mockHandleDelete}
        currentUser={currentUser} // Same user as blog creator
      />
    );

    // Make details visible
    const viewButton = screen.getByText('view');
    fireEvent.click(viewButton);

    // Delete button should be visible
    expect(screen.getByText('remove')).toBeInTheDocument();

    // Unmount the component for the next test
    unmount();

    // Test with different user (not creator)
    const differentUser = {
      id: 'different123',
      name: 'Different User',
      username: 'different',
    };

    renderWithRedux(
      <Blog
        blog={blog}
        updateBlogs={mockUpdateBlogs}
        handleDelete={mockHandleDelete}
        currentUser={differentUser}
      />
    );

    // Make details visible for the new render
    const anotherViewButton = screen.getByText('view');
    fireEvent.click(anotherViewButton);

    // Delete button should not be visible for non-creator
    expect(screen.queryByText('remove')).not.toBeInTheDocument();
  });

  test('clicking the delete button calls the event handler', () => {
    renderWithRedux(
      <Blog
        blog={blog}
        updateBlogs={mockUpdateBlogs}
        handleDelete={mockHandleDelete}
        currentUser={currentUser}
      />
    );

    // Make details visible
    const viewButton = screen.getByText('view');
    fireEvent.click(viewButton);

    // Find delete button and click it
    const deleteButton = screen.getByText('remove');
    fireEvent.click(deleteButton);

    expect(mockHandleDelete).toHaveBeenCalledTimes(1);
  });
});
