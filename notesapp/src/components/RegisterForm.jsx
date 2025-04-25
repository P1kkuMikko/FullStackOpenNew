import { useState } from 'react'
import userService from '../services/users'

const RegisterForm = ({ setNotification, setUser, loginService, noteService }) => {
  const [username, setUsername] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')

  const handleRegister = async (event) => {
    event.preventDefault()
    
    // Validate passwords match
    if (password !== passwordConfirm) {
      setNotification({ message: 'Passwords do not match', type: 'error' })
      setTimeout(() => {
        setNotification(null)
      }, 5000)
      return
    }

    try {
      // Register the user
      await userService.register({
        username,
        name,
        password
      })

      // Auto-login after successful registration
      const user = await loginService.login({
        username,
        password
      })

      window.localStorage.setItem(
        'loggedNoteappUser', JSON.stringify(user)
      )
      noteService.setToken(user.token)
      setUser(user)
      
      // Reset form
      setUsername('')
      setName('')
      setPassword('')
      setPasswordConfirm('')

      // Show success message
      setNotification({ message: 'Registration successful! You are now logged in.', type: 'success' })
      setTimeout(() => {
        setNotification(null)
      }, 5000)
    } catch (exception) {
      console.error('Registration error:', exception)
      const errorMsg = exception.response?.data?.error || 'Registration failed'
      setNotification({ message: errorMsg, type: 'error' })
      setTimeout(() => {
        setNotification(null)
      }, 5000)
    }
  }

  return (
    <div className="register-form">
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <div>
          <label htmlFor="username">Username (min 3 characters):</label>
          <input
            id="username"
            type="text"
            value={username}
            name="Username"
            minLength="3"
            required
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <div>
          <label htmlFor="name">Name:</label>
          <input
            id="name"
            type="text"
            value={name}
            name="Name"
            onChange={({ target }) => setName(target.value)}
          />
        </div>
        <div>
          <label htmlFor="password">Password (min 3 characters):</label>
          <input
            id="password"
            type="password"
            value={password}
            name="Password"
            minLength="3"
            required
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <div>
          <label htmlFor="passwordConfirm">Confirm Password:</label>
          <input
            id="passwordConfirm"
            type="password"
            value={passwordConfirm}
            name="PasswordConfirm"
            minLength="3"
            required
            onChange={({ target }) => setPasswordConfirm(target.value)}
          />
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  )
}

export default RegisterForm