const Notification = ({ message }) => {
  if (!message) {
    return null
  }

  // If message is a string (old format), display as error
  if (typeof message === 'string') {
    return <div className="error">{message}</div>
  }
  
  // If message is an object with type, use appropriate CSS class
  return <div className={message.type}>{message.message}</div>
}

export default Notification