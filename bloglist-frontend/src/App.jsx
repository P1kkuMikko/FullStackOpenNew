import { useState, useEffect, useRef } from 'react';
import Blog from './components/Blog';
import blogService from './services/blogs';
import loginService from './services/login';
import LoginForm from './components/LoginForm';
import BlogForm from './components/BlogForm';
import Notification from './components/Notification';
import Togglable from './components/Togglable';

const App = () => {
  const [blogs, setBlogs] = useState([]);
  const [user, setUser] = useState(null);
  const [notification, setNotification] = useState(null);
  const [notificationType, setNotificationType] = useState('success');
  const blogFormRef = useRef();

  const fetchBlogs = async () => {
    const blogs = await blogService.getAll();
    // Sort blogs by likes in descending order
    blogs.sort((a, b) => b.likes - a.likes);
    setBlogs(blogs);
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser');
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON);
      setUser(user);
      blogService.setToken(user.token);
    }
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification(message);
    setNotificationType(type);
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  const handleLogin = async (credentials) => {
    try {
      const user = await loginService.login(credentials);
      window.localStorage.setItem('loggedBlogappUser', JSON.stringify(user));
      blogService.setToken(user.token);
      setUser(user);
      showNotification(`Welcome ${user.name}`);
    } catch (exception) {
      showNotification('Wrong username or password', 'error');
    }
  };

  const handleLogout = () => {
    window.localStorage.removeItem('loggedBlogappUser');
    setUser(null);
    blogService.setToken(null);
    showNotification('Logged out successfully');
  };

  const addBlog = async (blogObject) => {
    try {
      blogFormRef.current.toggleVisibility();
      const returnedBlog = await blogService.create(blogObject);
      fetchBlogs(); // Fetch all blogs to get the updated list with proper user info
      showNotification(
        `A new blog ${returnedBlog.title} by ${returnedBlog.author} added`
      );
    } catch (exception) {
      showNotification('Error creating blog', 'error');
    }
  };

  const handleDeleteBlog = async (id) => {
    const blogToDelete = blogs.find((b) => b.id === id);
    if (
      window.confirm(
        `Remove blog ${blogToDelete.title} by ${blogToDelete.author}?`
      )
    ) {
      try {
        await blogService.remove(id);
        setBlogs(blogs.filter((blog) => blog.id !== id));
        showNotification(`Blog ${blogToDelete.title} was deleted`);
      } catch (exception) {
        showNotification('Error deleting blog', 'error');
      }
    }
  };

  const loginForm = () => <LoginForm handleLogin={handleLogin} />;

  const blogForm = () => (
    <Togglable buttonLabel='create new blog' ref={blogFormRef}>
      <BlogForm createBlog={addBlog} />
    </Togglable>
  );

  return (
    <div>
      <Notification message={notification} type={notificationType} />

      {user === null ? (
        loginForm()
      ) : (
        <div>
          <h2>blogs</h2>
          <p>
            {user.name} logged in
            <button onClick={handleLogout}>logout</button>
          </p>
          {blogForm()}
          {blogs.map((blog) => (
            <Blog
              key={blog.id}
              blog={blog}
              updateBlogs={fetchBlogs}
              handleDelete={() => handleDeleteBlog(blog.id)}
              currentUser={user}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default App;
