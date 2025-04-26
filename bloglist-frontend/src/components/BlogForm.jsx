import { useState } from 'react';

const BlogForm = ({ createBlog }) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [url, setUrl] = useState('');

  const addBlog = (event) => {
    event.preventDefault();
    createBlog({
      title,
      author,
      url,
    });

    // Reset form fields after submission
    setTitle('');
    setAuthor('');
    setUrl('');
  };

  return (
    <div>
      <h2>Create a new blog</h2>
      <form onSubmit={addBlog}>
        <div>
          title
          <input
            type='text'
            id='title'
            value={title}
            onChange={({ target }) => setTitle(target.value)}
            placeholder='title'
          />
        </div>
        <div>
          author
          <input
            type='text'
            id='author'
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
            placeholder='author'
          />
        </div>
        <div>
          url
          <input
            type='text'
            id='url'
            value={url}
            onChange={({ target }) => setUrl(target.value)}
            placeholder='url'
          />
        </div>
        <button type='submit' id='create-button'>
          create
        </button>
      </form>
    </div>
  );
};

export default BlogForm;
