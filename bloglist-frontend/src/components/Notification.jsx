const Notification = ({ message, type }) => {
  if (!message) return null;

  const style = {
    color: type === 'error' ? 'red' : 'green',
    background: 'lightgrey',
    fontSize: 16,
    borderStyle: 'solid',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  };

  return (
    <div style={style} className={`notification ${type}`}>
      {message}
    </div>
  );
};

export default Notification;
