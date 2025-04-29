import { createSlice } from '@reduxjs/toolkit';
import blogService from '../services/blogs';

const blogSlice = createSlice({
  name: 'blogs',
  initialState: [],
  reducers: {
    setBlogs(state, action) {
      return action.payload;
    },
    appendBlog(state, action) {
      state.push(action.payload);
    },
    updateBlog(state, action) {
      const updatedBlog = action.payload;
      return state.map(blog =>
        blog.id === updatedBlog.id ? updatedBlog : blog
      );
    },
    removeBlog(state, action) {
      const id = action.payload;
      return state.filter(blog => blog.id !== id);
    },
  },
});

export const { setBlogs, appendBlog, updateBlog, removeBlog } =
    blogSlice.actions;

// Action creators
export const initializeBlogs = () => {
  return async dispatch => {
    const blogs = await blogService.getAll();
    dispatch(setBlogs(blogs));
  };
};

export const createNewBlog = blogObject => {
  return async dispatch => {
    const newBlog = await blogService.create(blogObject);
    dispatch(appendBlog(newBlog));
    return newBlog;
  };
};

export const likeBlog = (id, blogObject) => {
  return async dispatch => {
    const updatedBlog = await blogService.update(id, {
      ...blogObject,
      likes: blogObject.likes + 1,
    });
    dispatch(updateBlog(updatedBlog));
    return updatedBlog;
  };
};

export const deleteBlog = id => {
  return async dispatch => {
    await blogService.remove(id);
    dispatch(removeBlog(id));
  };
};

export default blogSlice.reducer;
