import { useState } from 'react';
import PropTypes from 'prop-types';
import blogService from '../services/blogs';

const Blog = ({ blog, updateBlogs, handleDelete, currentUser }) => {
  const [visible, setVisible] = useState(false);

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5,
  };

  const toggleVisibility = () => {
    setVisible(!visible);
  };

  const handleLike = async () => {
    const updatedBlog = {
      ...blog,
      likes: blog.likes + 1,
      user: blog.user.id,
    };

    try {
      await blogService.update(blog.id, updatedBlog);
      // Force re-render of the parent component
      if (updateBlogs) {
        updateBlogs();
      }
    } catch (exception) {
      console.error('Error updating likes:', exception);
    }
  };

  // Check if current user is the creator of the blog
  const isOwner =
    currentUser &&
    blog.user &&
    (blog.user.username === currentUser.username ||
      blog.user.id === currentUser.id);

  return (
    <div style={blogStyle} className='blog' data-testid={`blog-${blog.id}`}>
      <div className='blog-header'>
        {blog.title} {blog.author}
        <button
          onClick={toggleVisibility}
          data-testid={`view-button-${blog.id}`}
        >
          {visible ? 'hide' : 'view'}
        </button>
      </div>
      {visible && (
        <div className='blog-details'>
          <div>{blog.url}</div>
          <div className='likes'>
            likes {blog.likes}
            <button onClick={handleLike} data-testid={`like-button-${blog.id}`}>
              like
            </button>
          </div>
          <div>{blog.user && blog.user.name}</div>
          {isOwner && (
            <button
              onClick={handleDelete}
              style={{ backgroundColor: '#f44336', color: 'white' }}
              data-testid={`remove-button-${blog.id}`}
            >
              remove
            </button>
          )}
        </div>
      )}
    </div>
  );
};

Blog.propTypes = {
  blog: PropTypes.shape({
    title: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    likes: PropTypes.number.isRequired,
    id: PropTypes.string.isRequired,
    user: PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      username: PropTypes.string,
    }),
  }).isRequired,
  updateBlogs: PropTypes.func,
  handleDelete: PropTypes.func,
  currentUser: PropTypes.object,
};

export default Blog;
