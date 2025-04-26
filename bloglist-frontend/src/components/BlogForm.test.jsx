import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BlogForm from './BlogForm';

describe('<BlogForm />', () => {
  // 5.16: Test that the form calls the callback with right details when a new blog is created
  test('calls the event handler with the right details when a new blog is created', async () => {
    const createBlog = vi.fn();
    const user = userEvent.setup();

    render(<BlogForm createBlog={createBlog} />);

    // Get form input fields
    const titleInput = screen.getByPlaceholderText('title');
    const authorInput = screen.getByPlaceholderText('author');
    const urlInput = screen.getByPlaceholderText('url');
    const submitButton = screen.getByText('create');

    // Fill in the form
    await user.type(titleInput, 'Test Blog Title');
    await user.type(authorInput, 'Test Author');
    await user.type(urlInput, 'http://testurl.com');

    // Submit the form
    await user.click(submitButton);

    // Check that createBlog was called with the right details
    expect(createBlog).toHaveBeenCalledTimes(1);
    expect(createBlog).toHaveBeenCalledWith({
      title: 'Test Blog Title',
      author: 'Test Author',
      url: 'http://testurl.com',
    });
  });
});
