const bcrypt = require('bcryptjs')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
    const users = await User.find({}).populate('blogs', { title: 1, author: 1, url: 1, likes: 1 })
    response.json(users)
})

usersRouter.post('/', async (request, response) => {
    const { username, name, password } = request.body

    // Validate password
    if (!password || password.length < 3) {
        return response.status(400).json({
            error: 'password must be at least 3 characters long'
        })
    }

    // Validate username length manually for clearer error message
    if (!username || username.length < 3) {
        return response.status(400).json({
            error: 'username must be at least 3 characters long'
        })
    }

    // Check if username already exists - critical for test reliability
    const existingUser = await User.findOne({ username })
    if (existingUser) {
        return response.status(400).json({
            error: 'username must be unique'
        })
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = new User({
        username,
        name,
        passwordHash
    })

    try {
        const savedUser = await user.save()
        response.status(201).json(savedUser)
    } catch (error) {
        // Double check for MongoDB unique index errors (code 11000)
        if (error.name === 'MongoServerError' && error.code === 11000) {
            return response.status(400).json({
                error: 'username must be unique'
            })
        }

        // Handle validation errors
        if (error.name === 'ValidationError') {
            return response.status(400).json({
                error: error.message
            })
        }

        // Handle other errors
        return response.status(500).json({
            error: 'something went wrong'
        })
    }
})

module.exports = usersRouter