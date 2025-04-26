/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from 'react';
import Footer from './components/Footer';
import Note from './components/Note';
import Notification from './components/Notification';
import LogoutButton from './components/LogoutButton';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import NoteForm from './components/NoteForm';
import Togglable from './components/Togglable';
import noteService from './services/notes';
import loginService from './services/login';

const App = () => {
  const [notes, setNotes] = useState(null);
  const [showAll, setShowAll] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [user, setUser] = useState(null);
  const noteFormRef = useRef();
  const loginFormRef = useRef();

  useEffect(() => {
    noteService.getAll().then((initialNotes) => {
      setNotes(initialNotes);
    });
  }, []);

  useEffect(() => {
    try {
      const loggedUserJSON = window.localStorage.getItem('loggedNoteappUser');
      if (loggedUserJSON) {
        const user = JSON.parse(loggedUserJSON);
        setUser(user);
        noteService.setToken(user.token);
      }
    } catch (e) {
      console.error('Could not parse user from localStorage', e);
      window.localStorage.removeItem('loggedNoteappUser');
    }
  }, []);

  if (!notes) {
    return null;
  }

  const handleLogin = async (credentials) => {
    try {
      const user = await loginService.login(credentials);

      window.localStorage.setItem('loggedNoteappUser', JSON.stringify(user));
      noteService.setToken(user.token);
      setUser(user);
    } catch (exception) {
      console.log(exception);
      const errorMsg =
        exception.response &&
        exception.response.data &&
        exception.response.data.error
          ? exception.response.data.error
          : 'Wrong credentials';
      setErrorMessage({ message: errorMsg, type: 'error' });
      setTimeout(() => {
        setErrorMessage(null);
      }, 5000);
    }
  };

  const handleLogout = () => {
    window.localStorage.removeItem('loggedNoteappUser');
    setUser(null);
    noteService.setToken(null);
  };

  const addNote = (noteObject) => {
    noteFormRef.current.toggleVisibility();
    noteService
      .create(noteObject)
      .then((returnedNote) => {
        setNotes(notes.concat(returnedNote));
      })
      .catch((error) => {
        setErrorMessage('Failed to create note');
        setTimeout(() => {
          setErrorMessage(null);
        }, 5000);
      });
  };

  const toggleImportanceOf = (id) => {
    const note = notes.find((n) => n.id === id);
    const changedNote = { ...note, important: !note.important };

    noteService
      .update(id, changedNote)
      .then((returnedNote) => {
        setNotes(notes.map((note) => (note.id !== id ? note : returnedNote)));
      })
      .catch((error) => {
        setErrorMessage(
          `Note '${note.content}' was already removed from server`
        );
        setTimeout(() => {
          setErrorMessage(null);
        }, 5000);
        setNotes(notes.filter((n) => n.id !== id));
      });
  };

  const loginForm = () => {
    return (
      <Togglable buttonLabel='log in' ref={loginFormRef}>
        <LoginForm handleLogin={handleLogin} />
      </Togglable>
    );
  };

  const registrationForm = () => (
    <Togglable buttonLabel='register'>
      <RegisterForm
        setNotification={setErrorMessage}
        setUser={setUser}
        loginService={loginService}
        noteService={noteService}
      />
    </Togglable>
  );

  const noteForm = () => (
    <Togglable buttonLabel='new note' ref={noteFormRef}>
      <NoteForm createNote={addNote} />
    </Togglable>
  );

  const notesToShow = showAll ? notes : notes.filter((note) => note.important);

  return (
    <div>
      <h1>Notes</h1>
      <Notification message={errorMessage} />

      {!user && (
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          {loginForm()}
          {registrationForm()}
        </div>
      )}
      {user && (
        <div>
          <LogoutButton onLogout={handleLogout} username={user.name} />
          {noteForm()}
        </div>
      )}

      <div>
        <button onClick={() => setShowAll(!showAll)}>
          show {showAll ? 'important' : 'all'}
        </button>
      </div>
      <ul>
        {notesToShow.map((note) => (
          <Note
            key={note.id}
            note={note}
            toggleImportance={() => toggleImportanceOf(note.id)}
          />
        ))}
      </ul>

      <Footer />
    </div>
  );
};

export default App;
