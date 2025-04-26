import PropTypes from 'prop-types';

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

Notification.propTypes = {
  message: PropTypes.string,
  type: PropTypes.string,
};

export default Notification;
