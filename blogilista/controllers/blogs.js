const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const { userExtractor } = require('../utils/middleware')

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
    response.json(blogs)
})

blogsRouter.post('/', userExtractor, async (request, response, next) => {
    const body = request.body

    try {
        const user = request.user

        if (!user) {
            return response.status(401).json({ error: 'token missing or invalid' })
        }

        const blog = new Blog({
            title: body.title,
            author: body.author,
            url: body.url,
            likes: body.likes || 0,
            user: user._id
        })

        const savedBlog = await blog.save()

        user.blogs = user.blogs.concat(savedBlog._id)
        await user.save()

        const populatedBlog = await Blog.findById(savedBlog._id).populate('user', { username: 1, name: 1 })

        response.status(201).json(populatedBlog)
    } catch (error) {
        next(error)
    }
})

blogsRouter.delete('/:id', userExtractor, async (request, response, next) => {
    try {
        const user = request.user

        if (!user) {
            return response.status(401).json({ error: 'token missing or invalid' })
        }

        const blog = await Blog.findById(request.params.id)

        if (!blog) {
            return response.status(404).json({ error: 'blog not found' })
        }

        if (blog.user.toString() !== user.id.toString()) {
            return response.status(403).json({ error: 'only the creator can delete a blog' })
        }

        await Blog.findByIdAndDelete(request.params.id)
        response.status(204).end()
    } catch (error) {
        next(error)
    }
})

blogsRouter.put('/:id', async (request, response, next) => {
    const { title, author, url, likes } = request.body

    try {
        const updatedBlog = await Blog.findByIdAndUpdate(
            request.params.id,
            { title, author, url, likes },
            { new: true, runValidators: true, context: 'query' }
        ).populate('user', { username: 1, name: 1 })

        if (updatedBlog) {
            response.json(updatedBlog)
        } else {
            response.status(404).end()
        }
    } catch (error) {
        next(error)
    }
})

module.exports = blogsRouter