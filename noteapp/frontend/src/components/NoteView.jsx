import { useParams } from 'react-router-dom';

const NoteView = ({ notes }) => {
  const id = useParams().id;
  const note =
    notes.find((n) => n.id === id) || notes.find((n) => n.id === Number(id));

  if (!note) {
    return <div>Note not found</div>;
  }

  return (
    <div>
      <h2>{note.content}</h2>
      <div>
        {note.user && <p>Added by: {note.user}</p>}
        <p>
          <strong>{note.important ? 'Important' : 'Not important'}</strong>
        </p>
        <p>
          Created:{' '}
          {note.date
            ? new Date(note.date).toLocaleDateString()
            : 'unknown date'}
        </p>
      </div>
    </div>
  );
};

export default NoteView;
