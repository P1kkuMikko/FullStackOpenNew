import { useState } from 'react';
import userService from '../services/users';
import PropTypes from 'prop-types';

const RegisterForm = ({
  setNotification,
  setUser,
  loginService,
  noteService,
}) => {
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const handleRegister = async (event) => {
    event.preventDefault();

    // Validate passwords match
    if (password !== passwordConfirm) {
      setNotification({ message: 'Passwords do not match', type: 'error' });
      setTimeout(() => {
        setNotification(null);
      }, 5000);
      return;
    }

    try {
      // Register the user
      await userService.register({
        username,
        name,
        password,
      });

      // Auto-login after successful registration
      const user = await loginService.login({
        username,
        password,
      });

      window.localStorage.setItem('loggedNoteappUser', JSON.stringify(user));
      noteService.setToken(user.token);
      setUser(user);

      // Reset form
      setUsername('');
      setName('');
      setPassword('');
      setPasswordConfirm('');

      // Show success message
      setNotification({
        message: 'Registration successful! You are now logged in.',
        type: 'success',
      });
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    } catch (exception) {
      console.error('Registration error:', exception);
      const errorMsg = exception.response?.data?.error || 'Registration failed';
      setNotification({ message: errorMsg, type: 'error' });
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <div>
          username
          <input
            value={username}
            onChange={({ target }) => setUsername(target.value)}
            name='Username'
            autoComplete='username'
          />
        </div>
        <div>
          name
          <input
            value={name}
            onChange={({ target }) => setName(target.value)}
            name='Name'
          />
        </div>
        <div>
          password
          <input
            type='password'
            value={password}
            onChange={({ target }) => setPassword(target.value)}
            name='Password'
            autoComplete='new-password'
          />
        </div>
        <div>
          confirm password
          <input
            type='password'
            value={passwordConfirm}
            onChange={({ target }) => setPasswordConfirm(target.value)}
            name='PasswordConfirm'
            autoComplete='new-password'
          />
        </div>
        <button type='submit'>register</button>
      </form>
    </div>
  );
};

RegisterForm.propTypes = {
  setNotification: PropTypes.func.isRequired,
  setUser: PropTypes.func.isRequired,
  loginService: PropTypes.object.isRequired,
  noteService: PropTypes.object.isRequired,
};

export default RegisterForm;
