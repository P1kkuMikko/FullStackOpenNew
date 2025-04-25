require('dotenv').config()

const PORT = process.env.PORT || 3003
// We'll need to set the MongoDB URL once you provide it
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/bloglist'

module.exports = {
    PORT,
    MONGODB_URI
}