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
        .then((persons) => {
            // Ensure no duplicate entries are returned
            const uniquePersons = persons.filter(
                (person, index, self) =>
                    index === self.findIndex((p) => p.name === person.name)
            );
            res.json(uniquePersons);
        })
        .catch((error) => next(error));
});

// Route to get info page
app.get('/info', (req, res, next) => {
    Person.countDocuments({})
        .then((count) => {
            const info = `
            <p>Phonebook has info for ${count} people</p>
            <p>${new Date().toString()}</p>
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
                res.json({
                    name: person.name,
                    number: person.number,
                    id: person.id,
                });
            } else {
                res.status(404).json({ error: 'Person not found' });
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

// Route to add a new person or update an existing one
app.post('/api/persons', (req, res, next) => {
    const body = req.body;

    if (!body.name || !body.number) {
        return res.status(400).json({ error: 'Name or number is missing' });
    }

    Person.findOneAndUpdate(
        { name: body.name },
        { number: body.number },
        { new: true, upsert: true, runValidators: true, context: 'query' }
    )
        .then((person) => res.json(person))
        .catch((error) => {
            if (error.code === 11000) {
                res.status(409).json({ error: 'Name must be unique' });
            } else {
                next(error);
            }
        });
});

// Route to update an existing person
app.put('/api/persons/:id', (req, res, next) => {
    const { name, number } = req.body;

    if (!name || !number) {
        return res.status(400).json({ error: 'Name or number is missing' });
    }

    Person.findByIdAndUpdate(
        req.params.id,
        { name, number },
        { new: true, runValidators: true, context: 'query' }
    )
        .then((updatedPerson) => {
            if (updatedPerson) {
                res.json(updatedPerson);
            } else {
                res.status(404).end();
            }
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
    } else if (error.name === 'ValidationError') {
        return res.status(400).json({ error: error.message });
    }

    next(error);
};
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});