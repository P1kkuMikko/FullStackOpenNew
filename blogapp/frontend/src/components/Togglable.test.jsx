import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import Togglable from './Togglable';

describe('Togglable Component', () => {
  test('renders its children but they are not visible initially', () => {
    render(
      <Togglable buttonLabel="Show Content">
        <div className="testDiv">togglable content</div>
      </Togglable>
    );

    // The content should exist in the DOM but be hidden initially
    const content = screen.getByText('togglable content');
    expect(content).not.toBeVisible();
  });

  test('after clicking the button, children are displayed', () => {
    render(
      <Togglable buttonLabel="Show Content">
        <div className="testDiv">togglable content</div>
      </Togglable>
    );

    // Click the button to show content
    const button = screen.getByText('Show Content');
    fireEvent.click(button);

    // The content should now be visible
    const content = screen.getByText('togglable content');
    expect(content).toBeVisible();
  });

  test('toggled content can be closed', () => {
    render(
      <Togglable buttonLabel="Show Content">
        <div className="testDiv">togglable content</div>
      </Togglable>
    );

    // First show the content
    const showButton = screen.getByText('Show Content');
    fireEvent.click(showButton);

    // Content should be visible
    let content = screen.getByText('togglable content');
    expect(content).toBeVisible();

    // Then hide it again
    const closeButton = screen.getByText('cancel');
    fireEvent.click(closeButton);

    // Content should now be hidden
    content = screen.getByText('togglable content');
    expect(content).not.toBeVisible();
  });

  test('toggling visibility using ref works correctly', async () => {
    // Create a ref object
    const ref = { current: null };

    render(
      <Togglable buttonLabel="Show Content" ref={ref}>
        <div data-testid="togglable-content">togglable content</div>
      </Togglable>
    );

    // Query by test ID to ensure uniqueness
    const content = screen.getByTestId('togglable-content');

    // Initially content should be hidden
    expect(content).not.toBeVisible();

    // Wrap state updates in act
    await act(async () => {
      // Make sure the ref is available
      if (ref.current && typeof ref.current.toggleVisibility === 'function') {
        ref.current.toggleVisibility();
      }
    });

    // Now content should be visible
    expect(content).toBeVisible();

    // Toggle visibility back to hidden
    await act(async () => {
      if (ref.current && typeof ref.current.toggleVisibility === 'function') {
        ref.current.toggleVisibility();
      }
    });

    expect(content).not.toBeVisible();
  });
});
