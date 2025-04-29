const express = require('express')
const testingRouter = express.Router()
const Blog = require('../models/blog')
const User = require('../models/user')

testingRouter.post('/reset', async (request, response) => {
    await Blog.deleteMany({})
    await User.deleteMany({})

    response.status(204).end()
})

// Add an endpoint to create test blogs
testingRouter.post('/blogs', async (request, response) => {
    const body = request.body

    try {
        // Create a blog with isTest flag set to true
        const blog = new Blog({
            ...body,
            isTest: true
        })

        const savedBlog = await blog.save()

        // If user ID is provided, associate blog with user
        if (body.userId) {
            const user = await User.findById(body.userId)
            if (user) {
                user.blogs = user.blogs.concat(savedBlog._id)
                await user.save()
            }
        }

        const populatedBlog = await Blog.findById(savedBlog._id).populate('user', { username: 1, name: 1 })
        response.status(201).json(populatedBlog)
    } catch (error) {
        response.status(400).json({ error: error.message })
    }
})

module.exports = testingRouter