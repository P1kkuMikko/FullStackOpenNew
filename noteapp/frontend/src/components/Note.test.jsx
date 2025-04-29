import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Note from './Note';

describe('Note component', () => {
  test('renders content', () => {
    const note = {
      content: 'Component testing is done with react-testing-library',
      important: true,
    };

    render(<Note note={note} />);

    // Debug the entire rendered component
    screen.debug();

    const element = screen.getByText(
      'Component testing is done with react-testing-library'
    );

    // Debug just the specific element
    screen.debug(element);

    expect(element).toBeDefined();
  });

  test('clicking the button calls event handler once', async () => {
    const note = {
      content: 'Component testing is done with react-testing-library',
      important: true,
    };

    const mockHandler = vi.fn();

    render(<Note note={note} toggleImportance={mockHandler} />);

    const user = userEvent.setup();
    const button = screen.getByText('make not important');
    await user.click(button);

    expect(mockHandler.mock.calls).toHaveLength(1);
  });
});
