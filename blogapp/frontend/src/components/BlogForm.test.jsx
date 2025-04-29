import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import BlogForm from './BlogForm';

describe('BlogForm Component', () => {
  test('calls createBlog with correct details on form submission', () => {
    const mockCreateBlog = vi.fn();
    const newBlog = {
      title: 'Test Blog Title',
      author: 'Test Author',
      url: 'https://test-url.com',
    };

    render(<BlogForm createBlog={mockCreateBlog} />);

    // Find form inputs by their id
    const titleInput = document.getElementById('title');
    const authorInput = document.getElementById('author');
    const urlInput = document.getElementById('url');

    // Fill in the form
    fireEvent.change(titleInput, { target: { value: newBlog.title } });
    fireEvent.change(authorInput, { target: { value: newBlog.author } });
    fireEvent.change(urlInput, { target: { value: newBlog.url } });

    // Submit the form
    const submitButton = screen.getByText('create');
    fireEvent.click(submitButton);

    // Check that createBlog was called with correct data
    expect(mockCreateBlog).toHaveBeenCalledWith(newBlog);
  });

  test('form fields are cleared after submission', () => {
    const mockCreateBlog = vi.fn();

    render(<BlogForm createBlog={mockCreateBlog} />);

    // Find form inputs
    const titleInput = document.getElementById('title');
    const authorInput = document.getElementById('author');
    const urlInput = document.getElementById('url');

    // Fill in the form
    fireEvent.change(titleInput, { target: { value: 'Test Title' } });
    fireEvent.change(authorInput, { target: { value: 'Test Author' } });
    fireEvent.change(urlInput, { target: { value: 'https://test.com' } });

    // Submit the form
    const submitButton = screen.getByText('create');
    fireEvent.click(submitButton);

    // Verify inputs are cleared
    expect(titleInput.value).toBe('');
    expect(authorInput.value).toBe('');
    expect(urlInput.value).toBe('');
  });
});
