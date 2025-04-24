require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const Person = require('./models/person'); // Import the Person model

const app = express();

// Configure morgan to log POST request data
morgan.token('body', (req) => JSON.stringify(req.body));
app.use(
    morgan(':method :url :status :res[content-length] - :response-time ms :body')
);
app.use(express.json());
app.use(express.static('dist')); // Ensure the frontend build is served

// Route to get all persons from MongoDB
app.get('/api/persons', (req, res) => {
    Person.find({}).then((persons) => {
        res.json(persons);
    });
});

// Route to get info page
app.get('/info', (req, res) => {
    Person.countDocuments({}).then((count) => {
        const info = `
        <p>Phonebook has info for ${count} people</p>
        <p>${new Date()}</p>
      `;
        res.send(info);
    });
});

// Route to get a single person by ID
app.get('/api/persons/:id', (req, res, next) => {
    Person.findById(req.params.id)
        .then((person) => {
            if (person) {
                res.json(person);
            } else {
                res.status(404).end();
            }
        })
        .catch((error) => next(error));
});

// Route to delete a person by ID
app.delete('/api/persons/:id', (req, res, next) => {
    Person.findByIdAndRemove(req.params.id)
        .then(() => {
            res.status(204).end();
        })
        .catch((error) => next(error));
});

// Route to add a new person
app.post('/api/persons', (req, res, next) => {
    const body = req.body;

    if (!body.name || !body.number) {
        return res.status(400).json({ error: 'Name or number is missing' });
    }

    const person = new Person({
        name: body.name,
        number: body.number,
    });

    person
        .save()
        .then((savedPerson) => {
            res.json(savedPerson);
        })
        .catch((error) => next(error));
});

// Fallback error handler for debugging
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});