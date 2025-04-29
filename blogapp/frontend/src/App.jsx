import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Blog from './components/Blog';
import LoginForm from './components/LoginForm';
import BlogForm from './components/BlogForm';
import Notification from './components/Notification';
import Togglable from './components/Togglable';
import Users from './components/Users';
import {
  initializeBlogs,
  createNewBlog,
  deleteBlog,
} from './reducers/blogReducer';
import { initializeUser, login, logout } from './reducers/userReducer';
import { showNotification } from './reducers/notificationReducer';

const App = () => {
  const dispatch = useDispatch();
  const blogs = useSelector(state => state.blogs);
  const user = useSelector(state => state.user);

  const blogFormRef = useRef();

  // Initialize blogs
  useEffect(() => {
    dispatch(initializeBlogs());
  }, [dispatch]);

  // Initialize user from local storage
  useEffect(() => {
    dispatch(initializeUser());
  }, [dispatch]);

  const handleLogin = async credentials => {
    try {
      await dispatch(login(credentials));
    } catch (error) {
      // Error handling is done in the login action
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const addBlog = async blogObject => {
    try {
      blogFormRef.current.toggleVisibility();
      const newBlog = await dispatch(createNewBlog(blogObject));
      dispatch(
        showNotification(
          `a new blog ${newBlog.title} by ${newBlog.author} added`,
          'success',
          5
        )
      );
    } catch (exception) {
      dispatch(showNotification('Error creating blog', 'error', 5));
    }
  };

  const handleDeleteBlog = async id => {
    const blogToDelete = blogs.find(b => b.id === id);
    if (
      window.confirm(
        `Remove blog ${blogToDelete.title} by ${blogToDelete.author}?`
      )
    ) {
      try {
        await dispatch(deleteBlog(id));
        dispatch(
          showNotification(
            `Blog ${blogToDelete.title} was deleted`,
            'success',
            5
          )
        );
      } catch (exception) {
        dispatch(showNotification('Error deleting blog', 'error', 5));
      }
    }
  };

  const loginForm = () => <LoginForm handleLogin={handleLogin} />;

  const blogForm = () => (
    <Togglable buttonLabel="create new blog" ref={blogFormRef}>
      <BlogForm createBlog={addBlog} />
    </Togglable>
  );

  // Sort blogs by likes in descending order
  const sortedBlogs = [...blogs].sort((a, b) => b.likes - a.likes);

  const navStyle = {
    padding: 5,
    backgroundColor: '#f0f0f0',
    marginBottom: 10,
  };

  const navLinkStyle = {
    padding: 5,
  };

  if (user === null) {
    return (
      <div>
        <Notification />
        {loginForm()}
      </div>
    );
  }

  return (
    <Router>
      <div>
        <Notification />

        <div style={navStyle}>
          <Link style={navLinkStyle} to="/">
            blogs
          </Link>
          <Link style={navLinkStyle} to="/users">
            users
          </Link>
          <span>
            {user.name} logged in
            <button onClick={handleLogout}>logout</button>
          </span>
        </div>

        <Routes>
          <Route path="/users" element={<Users />} />
          <Route
            path="/"
            element={
              <div>
                <h2>blogs</h2>
                {blogForm()}
                {sortedBlogs.map(blog => (
                  <Blog
                    key={blog.id}
                    blog={blog}
                    updateBlogs={() => dispatch(initializeBlogs())}
                    handleDelete={() => handleDeleteBlog(blog.id)}
                    currentUser={user}
                  />
                ))}
              </div>
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
