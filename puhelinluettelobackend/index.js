const express = require('express');
const morgan = require('morgan'); // Import morgan
const app = express();


// Configure morgan to log POST request data
morgan.token('body', (req) => JSON.stringify(req.body));
app.use(
    morgan(':method :url :status :res[content-length] - :response-time ms :body')
);
app.use(express.json());
app.use(express.static('dist')); // Ensure the frontend build is served

let persons = [
    { id: 1, name: 'Arto Hellas', number: '040-123456' },
    { id: 2, name: 'Ada Lovelace', number: '39-44-5323523' },
    { id: 3, name: 'Dan Abramov', number: '12-43-234345' },
    { id: 4, name: 'Mary Poppendieck', number: '39-23-6423122' },
];

// Route to get all persons
app.get('/api/persons', (req, res) => {
    res.json(persons);
});

// Route to get info page
app.get('/info', (req, res) => {
    const info = `
    <p>Phonebook has info for ${persons.length} people</p>
    <p>${new Date()}</p>
  `;
    res.send(info);
});

// Route to get a single person by ID
app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id);
    const person = persons.find(p => p.id === id);

    if (person) {
        res.json(person);
    } else {
        res.status(404).send({ error: 'Person not found' });
    }
});

// Route to delete a person by ID
app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id);
    persons = persons.filter(p => p.id !== id);
    res.status(204).end();
});

// Route to add a new person
app.post('/api/persons', (req, res) => {
    console.log('Request body:', req.body); // Debug log to inspect the request body

    const body = req.body || {}; // Ensure body is an object

    if (!body.name || !body.number) {
        return res.status(400).json({ error: 'Name or number is missing' });
    }

    if (persons.find(p => p.name === body.name)) {
        return res.status(400).json({ error: 'Name must be unique' });
    }

    const newPerson = {
        id: Math.floor(Math.random() * 1000000),
        name: body.name,
        number: body.number,
    };

    persons = persons.concat(newPerson);
    res.json(newPerson);
});

// Fallback error handler for debugging
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})