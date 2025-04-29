import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotes, createNote, updateNote } from './requests';
import { Container, Table, Form, Button, Alert } from 'react-bootstrap';
import { useState } from 'react';
import Navigation from './components/Navigation';
import Login from './components/Login';

const App = () => {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState(null);
  const [user, setUser] = useState(null);

  const result = useQuery({
    queryKey: ['notes'],
    queryFn: getNotes,
    refetchOnWindowFocus: false,
  });

  const newNoteMutation = useMutation({
    mutationFn: createNote,
    onSuccess: (newNote) => {
      const notes = queryClient.getQueryData(['notes']);
      queryClient.setQueryData(['notes'], notes.concat(newNote));
      setMessage('Note created successfully!');
      setTimeout(() => {
        setMessage(null);
      }, 5000);
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: updateNote,
    onSuccess: (updatedNote) => {
      const notes = queryClient.getQueryData(['notes']);
      queryClient.setQueryData(
        ['notes'],
        notes.map((note) => (note.id === updatedNote.id ? updatedNote : note))
      );
      setMessage(`Note "${updatedNote.content}" importance toggled!`);
      setTimeout(() => {
        setMessage(null);
      }, 5000);
    },
  });

  const login = (username) => {
    setUser(username);
    setMessage(`Welcome ${username}!`);
    setTimeout(() => {
      setMessage(null);
    }, 5000);
  };

  const addNote = async (event) => {
    event.preventDefault();
    const content = event.target.note.value;
    event.target.note.value = '';
    newNoteMutation.mutate({ content, important: true });
  };

  const toggleImportance = (note) => {
    updateNoteMutation.mutate({ ...note, important: !note.important });
  };

  if (result.isLoading) {
    return <div>loading data...</div>;
  }

  const notes = result.data;

  return (
    <div>
      <Navigation user={user} />

      <Container>
        {message && (
          <Alert variant='success' className='mt-3'>
            {message}
          </Alert>
        )}

        {!user ? (
          <Login onLogin={login} />
        ) : (
          <div>
            <h2>Notes app</h2>
            <Form onSubmit={addNote}>
              <Form.Group>
                <Form.Label>Add new note</Form.Label>
                <Form.Control
                  name='note'
                  placeholder='Write note content here'
                />
              </Form.Group>
              <Button variant='primary' type='submit' className='mt-2'>
                add
              </Button>
            </Form>
            <Table striped className='mt-4'>
              <thead>
                <tr>
                  <th>Content</th>
                  <th>Importance</th>
                </tr>
              </thead>
              <tbody>
                {notes.map((note) => (
                  <tr key={note.id} onClick={() => toggleImportance(note)}>
                    <td>{note.content}</td>
                    <td>
                      <Button
                        variant={
                          note.important ? 'success' : 'outline-secondary'
                        }
                        size='sm'
                      >
                        {note.important ? 'important' : 'not important'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Container>
    </div>
  );
};

export default App;
