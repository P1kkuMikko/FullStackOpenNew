const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const supertest = require('supertest')
const app = require('../app')
const User = require('../models/user')
const helper = require('./test_helper')

const api = supertest(app)

// Use a completely separate collection for each test run
const testCollectionSuffix = Date.now().toString()
const originalCollection = User.collection.name
User.collection.name = `${originalCollection}_${testCollectionSuffix}`

// Manually run each test in sequence
describe('when there is initially one user in db', () => {
    beforeEach(async () => {
        // Clear the test-specific collection
        await User.deleteMany({})

        // Create a test user
        const passwordHash = await bcrypt.hash('sekret', 10)
        const user = new User({ username: 'root', passwordHash })
        await user.save()
    })

    test('creation succeeds with a fresh username', async () => {
        // Get initial state
        const usersAtStart = await helper.usersInDb()
        assert.strictEqual(usersAtStart.length, 1)

        const newUser = {
            username: 'mluukkai',
            name: 'Matti Luukkainen',
            password: 'salainen',
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

        const usernames = usersAtEnd.map(u => u.username)
        assert(usernames.includes(newUser.username))

        // Clean up for next test
        await User.deleteMany({ username: newUser.username })
    })

    test('creation fails with proper statuscode and message if username already taken', async () => {
        // Reset database to known state
        await User.deleteMany({})
        const passwordHash = await bcrypt.hash('sekret', 10)
        const user = new User({ username: 'root', passwordHash })
        await user.save()

        const usersAtStart = await helper.usersInDb()
        assert.strictEqual(usersAtStart.length, 1)

        const newUser = {
            username: 'root',
            name: 'Superuser',
            password: 'salainen',
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        assert(result.body.error.includes('username'))
        assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })

    // Other tests similarly reset the database at beginning
    test('creation fails with proper statuscode if username too short', async () => {
        // Reset database to known state
        await User.deleteMany({})
        const passwordHash = await bcrypt.hash('sekret', 10)
        const user = new User({ username: 'root', passwordHash })
        await user.save()

        const usersAtStart = await helper.usersInDb()
        assert.strictEqual(usersAtStart.length, 1)

        const newUser = {
            username: 'ro',
            name: 'Superuser',
            password: 'salainen',
        }

        // eslint-disable-next-line no-unused-vars
        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })

    test('creation fails with proper statuscode if password too short', async () => {
        // Reset database to known state
        await User.deleteMany({})
        const passwordHash = await bcrypt.hash('sekret', 10)
        const user = new User({ username: 'root', passwordHash })
        await user.save()

        const usersAtStart = await helper.usersInDb()
        assert.strictEqual(usersAtStart.length, 1)

        const newUser = {
            username: 'newuser',
            name: 'New User',
            password: 'pw',
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        assert(result.body.error.includes('password'))
        assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })
})

after(async () => {
    // Restore the collection name
    User.collection.name = originalCollection
    await mongoose.connection.close()
})