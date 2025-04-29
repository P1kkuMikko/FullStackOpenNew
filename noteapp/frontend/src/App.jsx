/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, Navigate, useMatch } from 'react-router-dom';
import Footer from './components/Footer';
import Note from './components/Note';
import Notification from './components/Notification';
import LogoutButton from './components/LogoutButton';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import NoteForm from './components/NoteForm';
import Togglable from './components/Togglable';
import Home from './components/Home';
import Users from './components/Users';
import NoteList from './components/NoteList';
import NoteView from './components/NoteView';
import noteService from './services/notes';
import loginService from './services/login';

const App = () => {
  const [notes, setNotes] = useState(null);
  const [showAll, setShowAll] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [user, setUser] = useState(null);
  const noteFormRef = useRef();
  const loginFormRef = useRef();

  // Find note by id for the direct note view using useMatch
  const match = useMatch('/notes/:id');
  const note =
    match && notes
      ? notes.find(
          (note) =>
            note.id === match.params.id || note.id === Number(match.params.id)
        )
      : null;

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
        setErrorMessage({ message: 'Failed to create note', type: 'error' });
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
        setErrorMessage({
          message: `Note '${note.content}' was already removed from server`,
          type: 'error',
        });
        setTimeout(() => {
          setErrorMessage(null);
        }, 5000);
        setNotes(notes.filter((n) => n.id !== id));
      });
  };

  const padding = {
    padding: 5,
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
      <div
        style={{
          backgroundColor: '#f5f5f5',
          padding: '10px',
          marginBottom: '20px',
        }}
      >
        <h1 style={{ margin: '0 0 10px 0' }}>Notes App</h1>
        <div style={{ display: 'flex' }}>
          <Link style={padding} to='/'>
            home
          </Link>
          <Link style={padding} to='/notes'>
            notes
          </Link>
          <Link style={padding} to='/users'>
            users
          </Link>
          {user ? (
            <em style={padding}>{user.name || user.username} logged in</em>
          ) : (
            <Link style={padding} to='/login'>
              login
            </Link>
          )}
        </div>
      </div>

      <Notification message={errorMessage} />

      <Routes>
        <Route path='/notes/:id' element={<NoteView notes={notes} />} />
        <Route
          path='/notes'
          element={
            <>
              {user && noteForm()}
              <div>
                <button onClick={() => setShowAll(!showAll)}>
                  show {showAll ? 'important' : 'all'}
                </button>
              </div>
              <NoteList notes={notesToShow} />
            </>
          }
        />
        <Route
          path='/users'
          element={user ? <Users /> : <Navigate replace to='/login' />}
        />
        <Route
          path='/login'
          element={
            user ? (
              <Navigate replace to='/' />
            ) : (
              <div>
                {loginForm()}
                {registrationForm()}
              </div>
            )
          }
        />
        <Route
          path='/'
          element={
            <>
              <Home />
              {user && (
                <div style={{ marginTop: '20px' }}>
                  <LogoutButton
                    onLogout={handleLogout}
                    username={user.name || user.username}
                  />
                </div>
              )}
            </>
          }
        />
      </Routes>

      <Footer />
    </div>
  );
};

export default App;
