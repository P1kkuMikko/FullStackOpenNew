const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')
const { asyncHandler } = require('../utils/middleware')

// Create a new user
usersRouter.post('/', asyncHandler(async (request, response) => {
    const { username, name, password } = request.body

    if (!password || password.length < 3) {
        return response.status(400).json({
            error: 'password must be at least 3 characters long'
        })
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = new User({
        username,
        name,
        passwordHash,
    })

    const savedUser = await user.save()

    response.status(201).json(savedUser)
}))

// Get all users
usersRouter.get('/', asyncHandler(async (request, response) => {
    const users = await User
        .find({}).populate('notes', { content: 1, important: 1 })

    response.json(users)
}))

module.exports = usersRouter