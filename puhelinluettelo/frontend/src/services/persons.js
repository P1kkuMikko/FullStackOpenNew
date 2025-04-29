import axios from 'axios';

const baseUrl = '/api/persons'; // Ensure this matches the backend endpoint

const getAll = () => {
    return axios.get(baseUrl).then(response => response.data);
};

const create = (newPerson) => {
    return axios.post(baseUrl, newPerson)
        .then(response => response.data)
        .catch(error => {
            if (error.response && error.response.status === 409 && error.response.data.error === 'duplicate') {
                // If the backend indicates a duplicate, update the existing person
                const existingPerson = error.response.data.person;
                return update(existingPerson.id, newPerson);
            }
            throw error;
        });
};

const remove = (id) => {
    return axios.delete(`${baseUrl}/${id}`);
};

const update = (id, updatedPerson) => {
    return axios.put(`${baseUrl}/${id}`, updatedPerson).then(response => response.data);
};

export default { getAll, create, remove, update };
