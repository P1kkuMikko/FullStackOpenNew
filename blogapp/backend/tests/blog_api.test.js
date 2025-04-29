const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcryptjs')
const helper = require('./test_helper')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')

const api = supertest(app)

describe('when there are initially some blogs saved', () => {
    let token = null

    beforeEach(async () => {
        await Blog.deleteMany({})
        await User.deleteMany({})

        // Create a test user
        const passwordHash = await bcrypt.hash('testpassword', 10)
        const user = new User({
            username: 'testuser',
            name: 'Test User',
            passwordHash
        })
        const savedUser = await user.save()

        // Get an authentication token
        const loginResponse = await api
            .post('/api/login')
            .send({
                username: 'testuser',
                password: 'testpassword'
            })

        token = loginResponse.body.token

        // Create initial blogs with user reference
        const initialBlogsWithUser = helper.initialBlogs.map(blog => ({
            ...blog,
            user: savedUser._id
        }))

        await Blog.insertMany(initialBlogsWithUser)
    })

    test('blogs are returned as json', async () => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })

    test('all blogs are returned', async () => {
        const response = await api.get('/api/blogs')
        assert.strictEqual(response.body.length, helper.initialBlogs.length)
    })

    test('blogs have id property instead of _id', async () => {
        const response = await api.get('/api/blogs')
        const blog = response.body[0]
        assert.strictEqual(typeof blog.id, 'string')
        assert.strictEqual(blog._id, undefined)
    })

    test('blogs include user information', async () => {
        const response = await api.get('/api/blogs')
        const blog = response.body[0]
        assert(blog.user)
        assert.strictEqual(blog.user.username, 'testuser')
        assert.strictEqual(blog.user.name, 'Test User')
    })

    describe('addition of a new blog', () => {
        test('a valid blog can be added with valid token', async () => {
            const newBlog = {
                title: 'Test Blog',
                author: 'Test Author',
                url: 'https://testblog.com',
                likes: 10
            }

            await api
                .post('/api/blogs')
                .set('Authorization', `Bearer ${token}`)
                .send(newBlog)
                .expect(201)
                .expect('Content-Type', /application\/json/)

            const blogsAtEnd = await helper.blogsInDb()
            assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

            const titles = blogsAtEnd.map(blog => blog.title)
            assert(titles.includes('Test Blog'))
        })

        test('adding a blog fails with status code 401 if token is not provided', async () => {
            const newBlog = {
                title: 'Blog without token',
                author: 'Test Author',
                url: 'https://notoken.com',
                likes: 5
            }

            await api
                .post('/api/blogs')
                .send(newBlog)
                .expect(401)

            const blogsAtEnd = await helper.blogsInDb()
            assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
        })

        test('likes defaults to 0 if not provided', async () => {
            const newBlog = {
                title: 'Blog with no likes',
                author: 'Test Author',
                url: 'https://nolikes.com'
            }

            const response = await api
                .post('/api/blogs')
                .set('Authorization', `Bearer ${token}`)
                .send(newBlog)
                .expect(201)
                .expect('Content-Type', /application\/json/)

            assert.strictEqual(response.body.likes, 0)
        })

        test('blog without title is not added', async () => {
            const newBlog = {
                author: 'Missing Title',
                url: 'https://notitle.com',
                likes: 5
            }

            await api
                .post('/api/blogs')
                .set('Authorization', `Bearer ${token}`)
                .send(newBlog)
                .expect(400)

            const blogsAtEnd = await helper.blogsInDb()
            assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
        })

        test('blog without url is not added', async () => {
            const newBlog = {
                title: 'Missing URL',
                author: 'Test Author',
                likes: 5
            }

            await api
                .post('/api/blogs')
                .set('Authorization', `Bearer ${token}`)
                .send(newBlog)
                .expect(400)

            const blogsAtEnd = await helper.blogsInDb()
            assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
        })
    })

    describe('deletion of a blog', () => {
        test('succeeds with status code 204 if id is valid and user is the creator', async () => {
            const blogsAtStart = await helper.blogsInDb()
            const blogToDelete = blogsAtStart[0]

            await api
                .delete(`/api/blogs/${blogToDelete.id}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(204)

            const blogsAtEnd = await helper.blogsInDb()
            assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)

            const titles = blogsAtEnd.map(blog => blog.title)
            assert(!titles.includes(blogToDelete.title))
        })

        test('fails with status code 401 if token is not provided', async () => {
            const blogsAtStart = await helper.blogsInDb()
            const blogToDelete = blogsAtStart[0]

            await api
                .delete(`/api/blogs/${blogToDelete.id}`)
                .expect(401)

            const blogsAtEnd = await helper.blogsInDb()
            assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
        })

        test('fails with status code 403 if user is not the creator', async () => {
            // Create another user and get token for them
            const passwordHash = await bcrypt.hash('anotherpassword', 10)
            const anotherUser = new User({
                username: 'anotheruser',
                name: 'Another User',
                passwordHash
            })
            await anotherUser.save()

            const loginResponse = await api
                .post('/api/login')
                .send({
                    username: 'anotheruser',
                    password: 'anotherpassword'
                })

            const anotherToken = loginResponse.body.token

            // Try to delete a blog created by the first user
            const blogsAtStart = await helper.blogsInDb()
            const blogToDelete = blogsAtStart[0]

            await api
                .delete(`/api/blogs/${blogToDelete.id}`)
                .set('Authorization', `Bearer ${anotherToken}`)
                .expect(403)

            const blogsAtEnd = await helper.blogsInDb()
            assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
        })

        test('fails with status code 400 if id is invalid', async () => {
            await api
                .delete('/api/blogs/invalidid')
                .set('Authorization', `Bearer ${token}`)
                .expect(400)

            const blogsAtEnd = await helper.blogsInDb()
            assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
        })
    })

    describe('updating a blog', () => {
        test('succeeds with valid data', async () => {
            const blogsAtStart = await helper.blogsInDb()
            const blogToUpdate = blogsAtStart[0]

            const updatedBlog = {
                ...blogToUpdate,
                likes: blogToUpdate.likes + 1
            }

            await api
                .put(`/api/blogs/${blogToUpdate.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send(updatedBlog)
                .expect(200)
                .expect('Content-Type', /application\/json/)

            const blogsAtEnd = await helper.blogsInDb()
            const updatedBlogInDb = blogsAtEnd.find(blog => blog.id === blogToUpdate.id)
            assert.strictEqual(updatedBlogInDb.likes, blogToUpdate.likes + 1)
        })

        test('fails with status code 400 if id is invalid', async () => {
            const updatedBlog = {
                title: 'Updated Blog',
                author: 'Updated Author',
                url: 'https://updated.com',
                likes: 20
            }

            await api
                .put('/api/blogs/invalidid')
                .set('Authorization', `Bearer ${token}`)
                .send(updatedBlog)
                .expect(400)
        })

        test('returns 404 if blog does not exist', async () => {
            const validNonExistingId = await helper.nonExistingId()

            const updatedBlog = {
                title: 'Non-existing Blog',
                author: 'Non-existing Author',
                url: 'https://nonexisting.com',
                likes: 0
            }

            await api
                .put(`/api/blogs/${validNonExistingId}`)
                .set('Authorization', `Bearer ${token}`)
                .send(updatedBlog)
                .expect(404)
        })
    })
})

after(async () => {
    await mongoose.connection.close()
})