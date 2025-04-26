const express = require('express')
const mongoose = require('mongoose')
const config = require('./utils/config')
const logger = require('./utils/logger')
const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const middleware = require('./utils/middleware')
const path = require('path')

const app = express()

logger.info('connecting to MongoDB')

mongoose.connect(config.MONGODB_URI)
    .then(() => {
        logger.info('connected to MongoDB')
    })
    .catch((error) => {
        logger.error('error connecting to MongoDB:', error.message)
    })

app.use(express.json())
app.use(middleware.requestLogger)
app.use(middleware.tokenExtractor)

// Serve static files from the frontend build
app.use(express.static('build'))

// Health check endpoint for monitoring
app.get('/health', (req, res) => {
    res.send('ok')
})

app.get('/info', (req, res) => {
    res.send(`
        <p>Blog list application</p>
        <p>Server running on port ${config.PORT}</p>
        <p>${new Date()}</p>
    `)
})

// API routes
app.use('/api/blogs', blogsRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

// For frontend routes, serve the index.html
// Instead of using '*', specify exact routes or patterns
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'))
})

// Handle common frontend routes
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'))
})

app.get('/blogs', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'))
})

// Serve index.html for any unmatched routes without using '*'
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'))
})

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app