import { useState } from 'react';
import PropTypes from 'prop-types';

const LoginForm = ({ handleLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = (event) => {
    event.preventDefault();
    handleLogin({
      username,
      password,
    });
  };

  return (
    <div>
      <h2>Login</h2>

      <form onSubmit={onSubmit}>
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
          password
          <input
            type='password'
            value={password}
            onChange={({ target }) => setPassword(target.value)}
            name='Password'
            autoComplete='current-password'
          />
        </div>
        <button type='submit'>login</button>
      </form>
    </div>
  );
};

LoginForm.propTypes = {
  handleLogin: PropTypes.func.isRequired,
};

export default LoginForm;
