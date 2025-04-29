import { useSelector } from 'react-redux';

const Notification = () => {
  const notification = useSelector(state => state.notification);

  if (!notification.message) {
    return null;
  }

  const style = {
    color: notification.type === 'error' ? 'red' : 'green',
    background: 'lightgrey',
    fontSize: '20px',
    borderStyle: 'solid',
    borderRadius: '5px',
    padding: '10px',
    marginBottom: '10px',
  };

  return (
    <div style={style} className="notification">
      {notification.message}
    </div>
  );
};

export default Notification;
