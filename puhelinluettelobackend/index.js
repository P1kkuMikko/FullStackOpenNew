require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const Person = require('./models/person');

const app = express();

// Configure morgan to log POST request data
morgan.token('body', (req) => JSON.stringify(req.body));
app.use(
    morgan(':method :url :status :res[content-length] - :response-time ms :body')
);
app.use(express.json());
app.use(express.static('dist'));

// Route to get all persons
app.get('/api/persons', (req, res, next) => {
    Person.find({})
        .then((persons) => res.json(persons))
        .catch((error) => next(error));
});

// Route to get info page
app.get('/info', (req, res, next) => {
    Person.countDocuments({})
        .then((count) => {
            const info = `
            <p>Phonebook has info for ${count} people</p>
            <p>${new Date()}</p>
          `;
            res.send(info);
        })
        .catch((error) => next(error));
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
    Person.findByIdAndDelete(req.params.id)
        .then((result) => {
            if (result) {
                res.status(204).end();
            } else {
                res.status(404).end();
            }
        })
        .catch((error) => next(error));
});

// Route to add a new person
app.post('/api/persons', (req, res, next) => {
    const body = req.body;

    if (!body.name || !body.number) {
        return res.status(400).json({ error: 'Name or number is missing' });
    }

    Person.findOne({ name: body.name })
        .then((existingPerson) => {
            if (existingPerson) {
                // Update the number if the person already exists
                existingPerson.number = body.number;
                return existingPerson.save().then((updatedPerson) => {
                    res.json(updatedPerson);
                });
            } else {
                // Create a new person if they don't exist
                const person = new Person({
                    name: body.name,
                    number: body.number,
                });

                return person.save().then((savedPerson) => {
                    res.json(savedPerson);
                });
            }
        })
        .catch((error) => next(error));
});

// Route to update an existing person
app.put('/api/persons/:id', (req, res, next) => {
    const { name, number } = req.body;

    Person.findById(req.params.id)
        .then((person) => {
            if (!person) {
                return res.status(404).end();
            }

            person.name = name;
            person.number = number;

            return person.save().then((updatedPerson) => res.json(updatedPerson));
        })
        .catch((error) => next(error));
});

// Middleware for unknown endpoints
const unknownEndpoint = (req, res) => {
    res.status(404).send({ error: 'unknown endpoint' });
};
app.use(unknownEndpoint);

// Centralized error handling middleware
const errorHandler = (error, req, res, next) => {
    console.error(error.message);

    if (error.name === 'CastError') {
        return res.status(400).send({ error: 'malformatted id' });
    }

    next(error);
};
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});