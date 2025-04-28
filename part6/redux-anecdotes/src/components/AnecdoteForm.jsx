import { useDispatch } from 'react-redux';
import { createAnecdote } from '../reducers/anecdoteReducer';
import { useNotificationDispatch } from '../hooks/notificationHooks';
import { showNotification } from '../utils/notificationUtils';

const AnecdoteForm = () => {
  const dispatch = useDispatch();
  const notificationDispatch = useNotificationDispatch();

  const addAnecdote = async (event) => {
    event.preventDefault();
    const content = event.target.anecdote.value;
    event.target.anecdote.value = '';

    try {
      // Check if content is at least 5 characters long
      if (content.length < 5) {
        showNotification(
          notificationDispatch,
          'Anecdote must be at least 5 characters long',
          5
        );
        return;
      }

      await dispatch(createAnecdote(content));
      showNotification(notificationDispatch, `you created '${content}'`, 5);
    } catch (error) {
      showNotification(
        notificationDispatch,
        `Error creating anecdote: ${error.message}`,
        5
      );
    }
  };

  return (
    <div>
      <h2>create new</h2>
      <form onSubmit={addAnecdote}>
        <div>
          <input name='anecdote' />
        </div>
        <button type='submit'>create</button>
      </form>
    </div>
  );
};

export default AnecdoteForm;
