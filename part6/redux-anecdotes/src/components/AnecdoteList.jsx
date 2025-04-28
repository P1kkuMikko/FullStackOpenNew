import { useSelector, useDispatch } from 'react-redux';
import { voteAnecdote } from '../reducers/anecdoteReducer';
import { useNotificationDispatch } from '../hooks/notificationHooks';
import { showNotification } from '../utils/notificationUtils';

const AnecdoteList = () => {
  const anecdotes = useSelector((state) => {
    // Filter anecdotes based on filter state
    const filter = state.filter.toLowerCase();
    const filteredAnecdotes =
      filter === ''
        ? state.anecdotes
        : state.anecdotes.filter((a) =>
            a.content.toLowerCase().includes(filter)
          );

    // Sort by votes in descending order
    return [...filteredAnecdotes].sort((a, b) => b.votes - a.votes);
  });

  const dispatch = useDispatch();
  const notificationDispatch = useNotificationDispatch();

  const vote = async (id) => {
    console.log('vote', id);
    // Find the anecdote to show its content in the notification
    const anecdote = anecdotes.find((a) => a.id === id);

    try {
      await dispatch(voteAnecdote(id));
      showNotification(
        notificationDispatch,
        `you voted '${anecdote.content}'`,
        5
      );
    } catch (error) {
      showNotification(
        notificationDispatch,
        `Error voting for anecdote: ${error.message}`,
        5
      );
    }
  };

  return (
    <div>
      {anecdotes.map((anecdote) => (
        <div key={anecdote.id}>
          <div>{anecdote.content}</div>
          <div>
            has {anecdote.votes}
            <button onClick={() => vote(anecdote.id)}>vote</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnecdoteList;
