import axios from 'axios';

const baseUrl = 'http://localhost:3001/anecdotes';

const getAll = async () => {
    const response = await axios.get(baseUrl);
    return response.data;
};

const createNew = async (content) => {
    // Server requires anecdotes to be at least 5 characters long
    if (content.length < 5) {
        throw new Error('Anecdote must be at least 5 characters long');
    }

    const object = { content, votes: 0 };
    const response = await axios.post(baseUrl, object);
    return response.data;
};

const updateVotes = async (id) => {
    const response = await axios.get(`${baseUrl}/${id}`);
    const anecdoteToUpdate = response.data;

    const updatedAnecdote = {
        ...anecdoteToUpdate,
        votes: anecdoteToUpdate.votes + 1
    };

    const putResponse = await axios.put(`${baseUrl}/${id}`, updatedAnecdote);
    return putResponse.data;
};

export default { getAll, createNew, updateVotes };