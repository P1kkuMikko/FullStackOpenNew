require('dotenv').config()

const PORT = process.env.PORT || 3003
const MONGODB_URI = process.env.NODE_ENV === 'test'
    ? process.env.TEST_MONGODB_URI
    : process.env.MONGODB_URI

// Secret for JWT token signing
const SECRET = process.env.SECRET || 'default-secret-for-development-only'

module.exports = {
    PORT,
    MONGODB_URI,
    SECRET
}