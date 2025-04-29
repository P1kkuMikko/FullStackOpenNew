const notesRouter = require('express').Router()
const Note = require('../models/note')
const User = require('../models/user')
const { asyncHandler, getTokenFrom } = require('../utils/middleware')
const jwt = require('jsonwebtoken')

// GET all notes
notesRouter.get('/', asyncHandler(async (request, response) => {
    const notes = await Note.find({}).populate('user', { username: 1, name: 1 })
    response.json(notes)
}))

// GET a single note
notesRouter.get('/:id', asyncHandler(async (request, response) => {
    const note = await Note.findById(request.params.id).populate('user', { username: 1, name: 1 })
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

    // Get token and verify
    const token = getTokenFrom(request)
    const decodedToken = jwt.verify(token, process.env.SECRET)

    if (!decodedToken.id) {
        return response.status(401).json({ error: 'token invalid' })
    }

    const user = await User.findById(decodedToken.id)
    if (!user) {
        return response.status(404).json({ error: 'user not found' })
    }

    const note = new Note({
        content: body.content,
        important: body.important || false,
        user: user._id
    })

    const savedNote = await note.save()
    user.notes = user.notes.concat(savedNote._id)
    await user.save()

    // Populate user information before returning
    const populatedNote = await Note.findById(savedNote._id).populate('user', { username: 1, name: 1 })
    response.status(201).json(populatedNote)
}))

// DELETE a note
notesRouter.delete('/:id', asyncHandler(async (request, response) => {
    const note = await Note.findById(request.params.id)
    if (!note) {
        return response.status(404).end()
    }

    // Also remove the note reference from the user
    if (note.user) {
        const user = await User.findById(note.user)
        if (user) {
            user.notes = user.notes.filter(noteId => noteId.toString() !== request.params.id)
            await user.save()
        }
    }

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
    const populatedNote = await Note.findById(updatedNote._id).populate('user', { username: 1, name: 1 })
    response.json(populatedNote)
}))

module.exports = notesRouter