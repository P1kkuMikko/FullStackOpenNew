import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { initializeUsers } from '../reducers/usersReducer';

const Users = () => {
  const dispatch = useDispatch();
  const users = useSelector(state => state.users);

  useEffect(() => {
    dispatch(initializeUsers());
  }, [dispatch]);

  const tableStyle = {
    borderCollapse: 'collapse',
    width: '100%',
    marginTop: 10,
  };

  const cellStyle = {
    border: '1px solid #ddd',
    padding: 8,
  };

  const headerCellStyle = {
    ...cellStyle,
    paddingTop: 12,
    paddingBottom: 12,
    textAlign: 'left',
    backgroundColor: '#f2f2f2',
  };

  return (
    <div data-testid="users-component">
      <h2>Users</h2>
      <table style={tableStyle} data-testid="users-table">
        <thead>
          <tr>
            <th style={headerCellStyle}></th>
            <th style={headerCellStyle}>blogs created</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} data-testid={`user-row-${user.id}`}>
              <td style={cellStyle}>{user.name}</td>
              <td style={cellStyle}>{user.blogs.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Users;
