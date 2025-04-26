import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Blog from './Blog';

// Mock the blogs service
vi.mock('../services/blogs', () => ({
  default: {
    update: vi.fn().mockResolvedValue({}),
  },
}));

describe('<Blog />', () => {
  let container;
  const mockUpdateBlogs = vi.fn();
  const mockHandleDelete = vi.fn();

  const blog = {
    title: 'Test blog title',
    author: 'Test Author',
    url: 'http://test-url.com',
    likes: 5,
    id: '123456',
    user: {
      id: 'user123',
      name: 'Test User',
      username: 'testuser',
    },
  };

  const currentUser = {
    username: 'testuser',
    name: 'Test User',
    id: 'user123',
  };

  beforeEach(() => {
    // Reset mocks between tests
    vi.clearAllMocks();

    container = render(
      <Blog
        blog={blog}
        updateBlogs={mockUpdateBlogs}
        handleDelete={mockHandleDelete}
        currentUser={currentUser}
      />
    ).container;
  });

  // 5.13: Test that only title and author are rendered initially
  test('renders title and author but not url or likes by default', () => {
    // Verify title and author are visible
    expect(
      screen.getByText(`${blog.title} ${blog.author}`, { exact: false })
    ).toBeDefined();

    // Check that url and likes are not rendered
    const urlElement = screen.queryByText(blog.url);
    const likesElement = screen.queryByText(`likes ${blog.likes}`, {
      exact: false,
    });

    expect(urlElement).toBeNull();
    expect(likesElement).toBeNull();
  });

  // 5.14: Test that url, likes, and user are shown when view button is clicked
  test('shows url and likes when view button is clicked', async () => {
    const user = userEvent.setup();
    const button = screen.getByText('view');
    await user.click(button);

    // After clicking, these elements should be visible
    expect(screen.getByText(blog.url)).toBeDefined();
    expect(
      screen.getByText(`likes ${blog.likes}`, { exact: false })
    ).toBeDefined();
    expect(screen.getByText(blog.user.name)).toBeDefined();
  });

  // 5.15: Test that if like button is clicked twice, the event handler is called twice
  test('like button event handler is called twice when clicked twice', async () => {
    const user = userEvent.setup();

    // First click the view button to show the like button
    const viewButton = screen.getByText('view');
    await user.click(viewButton);

    // Now click the like button twice
    const likeButton = screen.getByText('like');
    await user.click(likeButton);
    await user.click(likeButton);

    // Check that the mockUpdateBlogs was called twice
    expect(mockUpdateBlogs).toHaveBeenCalledTimes(2);
  });
});
