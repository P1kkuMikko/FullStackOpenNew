import { describe, test, expect, vi, beforeEach } from 'vitest';
import blogReducer, {
  setBlogs,
  appendBlog,
  updateBlog,
  removeBlog,
  initializeBlogs,
  createNewBlog,
  likeBlog,
  deleteBlog
} from './blogReducer';

// Proper way to mock modules with default exports
vi.mock('../services/blogs', () => {
  return {
    default: {
      getAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn()
    }
  };
});

const blogService = await import('../services/blogs');

describe('blogReducer', () => {
  let initialState;
  let sampleBlogs;

  beforeEach(() => {
    initialState = [];

    sampleBlogs = [
      {
        id: '1',
        title: 'First test blog',
        author: 'Test Author 1',
        url: 'http://test1.com',
        likes: 5,
        user: { id: 'user1', name: 'User One', username: 'user1' }
      },
      {
        id: '2',
        title: 'Second test blog',
        author: 'Test Author 2',
        url: 'http://test2.com',
        likes: 10,
        user: { id: 'user2', name: 'User Two', username: 'user2' }
      }
    ];

    vi.resetAllMocks();
  });

  test('returns initial state when called with undefined state', () => {
    const action = { type: 'UNKNOWN_ACTION' };
    const newState = blogReducer(undefined, action);
    expect(newState).toEqual([]);
  });

  test('setBlogs replaces the entire state with new blogs', () => {
    const action = setBlogs(sampleBlogs);
    const newState = blogReducer(initialState, action);
    expect(newState).toEqual(sampleBlogs);
  });

  test('appendBlog adds a blog to the state', () => {
    const newBlog = {
      id: '3',
      title: 'Third test blog',
      author: 'Test Author 3',
      url: 'http://test3.com',
      likes: 7,
      user: { id: 'user1', name: 'User One', username: 'user1' }
    };

    const action = appendBlog(newBlog);
    const stateWithTwoBlogs = [...sampleBlogs];
    const newState = blogReducer(stateWithTwoBlogs, action);

    expect(newState).toHaveLength(3);
    expect(newState).toContainEqual(newBlog);
  });

  test('updateBlog updates a blog in the state', () => {
    const stateWithBlogs = [...sampleBlogs];

    const updatedBlog = {
      ...sampleBlogs[0],
      likes: 15,
      title: 'Updated title'
    };

    const action = updateBlog(updatedBlog);
    const newState = blogReducer(stateWithBlogs, action);

    expect(newState).toHaveLength(2);
    expect(newState).toContainEqual(updatedBlog);
    expect(newState).toContainEqual(sampleBlogs[1]);
    expect(newState[0].likes).toBe(15);
    expect(newState[0].title).toBe('Updated title');
  });

  test('removeBlog removes a blog from the state', () => {
    const stateWithBlogs = [...sampleBlogs];
    const idToRemove = '1';

    const action = removeBlog(idToRemove);
    const newState = blogReducer(stateWithBlogs, action);

    expect(newState).toHaveLength(1);
    expect(newState).toContainEqual(sampleBlogs[1]);
    expect(newState.find(blog => blog.id === idToRemove)).toBeUndefined();
  });

  // Thunk action tests
  test('initializeBlogs thunk dispatches setBlogs with blogs from service', async () => {
    const dispatch = vi.fn();
    blogService.default.getAll.mockResolvedValue(sampleBlogs);

    await initializeBlogs()(dispatch);

    expect(blogService.default.getAll).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith(setBlogs(sampleBlogs));
  });

  test('createNewBlog thunk calls blog service and dispatches appendBlog', async () => {
    const newBlog = {
      title: 'New blog',
      author: 'New Author',
      url: 'http://new.com'
    };

    const createdBlog = {
      ...newBlog,
      id: '3',
      likes: 0,
      user: { id: 'user1', name: 'User One', username: 'user1' }
    };

    blogService.default.create.mockResolvedValue(createdBlog);

    const dispatch = vi.fn();
    const returnedBlog = await createNewBlog(newBlog)(dispatch);

    expect(blogService.default.create).toHaveBeenCalledWith(newBlog);
    expect(dispatch).toHaveBeenCalledWith(appendBlog(createdBlog));
    expect(returnedBlog).toEqual(createdBlog);
  });

  test('likeBlog thunk updates blog with increased likes', async () => {
    const blogToLike = sampleBlogs[0];
    const expectedUpdate = {
      ...blogToLike,
      likes: blogToLike.likes + 1
    };

    blogService.default.update.mockResolvedValue(expectedUpdate);

    const dispatch = vi.fn();
    await likeBlog(blogToLike.id, blogToLike)(dispatch);

    expect(blogService.default.update).toHaveBeenCalledWith(blogToLike.id, {
      ...blogToLike,
      likes: blogToLike.likes + 1
    });
    expect(dispatch).toHaveBeenCalledWith(updateBlog(expectedUpdate));
  });

  test('deleteBlog thunk removes blog', async () => {
    const blogId = '2';
    blogService.default.remove.mockResolvedValue({});

    const dispatch = vi.fn();
    await deleteBlog(blogId)(dispatch);

    expect(blogService.default.remove).toHaveBeenCalledWith(blogId);
    expect(dispatch).toHaveBeenCalledWith(removeBlog(blogId));
  });
});