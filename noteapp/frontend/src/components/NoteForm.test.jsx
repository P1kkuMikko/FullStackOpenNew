import { test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NoteForm from './NoteForm';

test('<NoteForm /> updates parent state and calls onSubmit', async () => {
  const user = userEvent.setup();
  const createNote = vi.fn();

  render(<NoteForm createNote={createNote} />);

  // Find the input using the placeholder text
  const input = screen.getByPlaceholderText('write note content here');
  const sendButton = screen.getByText('save');

  await user.type(input, 'testing a form...');
  await user.click(sendButton);

  expect(createNote.mock.calls).toHaveLength(1);
  expect(createNote.mock.calls[0][0].content).toBe('testing a form...');
});

test('logging mock calls for debugging purposes', async () => {
  const user = userEvent.setup();
  const createNote = vi.fn();

  render(<NoteForm createNote={createNote} />);

  const input = screen.getByPlaceholderText('write note content here');
  const sendButton = screen.getByText('save');

  await user.type(input, 'testing a form...');
  await user.click(sendButton);

  // This would log the mock calls to the console for debugging
  console.log(createNote.mock.calls);
});
