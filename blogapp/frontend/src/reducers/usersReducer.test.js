import { describe, test, expect, vi, beforeEach } from 'vitest';
import usersReducer, { setUsers, initializeUsers } from './usersReducer';

// Mock the users service
vi.mock('../services/users', () => ({
  default: {
    getAll: vi.fn()
  }
}));

const usersService = await import('../services/users');

describe('usersReducer', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('returns empty array as initial state', () => {
    const action = { type: 'UNKNOWN_ACTION' };
    const newState = usersReducer(undefined, action);
    expect(newState).toEqual([]);
  });

  test('setUsers action sets the users state', () => {
    const users = [
      {
        id: 'user1',
        username: 'testuser1',
        name: 'Test User 1',
        blogs: [{ id: 'blog1' }, { id: 'blog2' }]
      },
      {
        id: 'user2',
        username: 'testuser2',
        name: 'Test User 2',
        blogs: [{ id: 'blog3' }]
      }
    ];

    const action = setUsers(users);
    const newState = usersReducer([], action);
    expect(newState).toEqual(users);
  });

  test('initializeUsers thunk fetches users and dispatches setUsers action', async () => {
    const users = [
      {
        id: 'user1',
        username: 'testuser1',
        name: 'Test User 1',
        blogs: [{ id: 'blog1' }, { id: 'blog2' }]
      },
      {
        id: 'user2',
        username: 'testuser2',
        name: 'Test User 2',
        blogs: [{ id: 'blog3' }]
      }
    ];

    usersService.default.getAll.mockResolvedValue(users);

    const dispatch = vi.fn();
    await initializeUsers()(dispatch);

    // Verify that the service was called
    expect(usersService.default.getAll).toHaveBeenCalled();

    // Verify that dispatch was called with the setUsers action
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'users/setUsers',
        payload: users
      })
    );
  });
});