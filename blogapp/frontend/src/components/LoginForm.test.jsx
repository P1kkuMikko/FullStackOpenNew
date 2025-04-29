import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import LoginForm from './LoginForm';

describe('LoginForm Component', () => {
  test('calls handleLogin with correct credentials on submit', () => {
    const mockHandleLogin = vi.fn();
    const testCredentials = {
      username: 'testuser',
      password: 'secretpassword',
    };

    render(<LoginForm handleLogin={mockHandleLogin} />);

    // Find the username and password inputs directly using query selectors
    const usernameInput = document.querySelector('input[name="Username"]');
    const passwordInput = document.querySelector('input[name="Password"]');
    const submitButton = screen.getByText('login');

    // Fill in the form
    fireEvent.change(usernameInput, {
      target: { value: testCredentials.username },
    });
    fireEvent.change(passwordInput, {
      target: { value: testCredentials.password },
    });

    // Submit the form
    fireEvent.click(submitButton);

    // Check that handleLogin was called with the right credentials
    expect(mockHandleLogin).toHaveBeenCalledWith(testCredentials);
  });

  test('form clears inputs after submission', () => {
    const mockHandleLogin = vi.fn();

    render(<LoginForm handleLogin={mockHandleLogin} />);

    // Find inputs directly
    const usernameInput = document.querySelector('input[name="Username"]');
    const passwordInput = document.querySelector('input[name="Password"]');
    const submitButton = screen.getByText('login');

    // Fill in the form
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // Submit the form
    fireEvent.click(submitButton);

    // Check that inputs are cleared
    expect(usernameInput.value).toBe('');
    expect(passwordInput.value).toBe('');
  });
});
