import React from 'react'

const LogoutButton = ({ onLogout, username }) => {
  return (
    <div className="logout-container">
      <span>{username} logged in</span>
      <button onClick={onLogout}>logout</button>
    </div>
  )
}

export default LogoutButton