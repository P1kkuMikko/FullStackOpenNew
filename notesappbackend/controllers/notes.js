const notesRouter = require('express').Router()
const Note = require('../models/note')
const { asyncHandler } = require('../utils/middleware')

// GET all notes
notesRouter.get('/', asyncHandler(async (request, response) => {
    const notes = await Note.find({})
    response.json(notes)
}))

// GET a single note
notesRouter.get('/:id', asyncHandler(async (request, response) => {
    const note = await Note.findById(request.params.id)
    if (note) {
        response.json(note)
    } else {
        response.status(404).end()
    }
}))

// POST create a new note
notesRouter.post('/', asyncHandler(async (request, response) => {
    const body = request.body

    if (!body.content) {
        return response.status(400).json({ error: 'content missing' })
    }

    const note = new Note({
        content: body.content,
        important: body.important || false,
    })

    const savedNote = await note.save()
    response.status(201).json(savedNote)
}))

// DELETE a note
notesRouter.delete('/:id', asyncHandler(async (request, response) => {
    await Note.findByIdAndDelete(request.params.id)
    response.status(204).end()
}))

// PUT update a note
notesRouter.put('/:id', asyncHandler(async (request, response) => {
    const { content, important } = request.body

    const note = await Note.findById(request.params.id)
    if (!note) {
        return response.status(404).end()
    }

    note.content = content
    note.important = important

    const updatedNote = await note.save()
    response.json(updatedNote)
}))

module.exports = notesRouter