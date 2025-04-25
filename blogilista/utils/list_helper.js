const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
    if (blogs.length === 0) {
        return null
    }

    return blogs.reduce((favorite, blog) => {
        return blog.likes > favorite.likes ? blog : favorite
    }, blogs[0])
}

const mostBlogs = (blogs) => {
    if (blogs.length === 0) {
        return null
    }

    const authorCounts = {}

    blogs.forEach(blog => {
        authorCounts[blog.author] = (authorCounts[blog.author] || 0) + 1
    })

    let maxAuthor = null
    let maxBlogs = 0

    for (const [author, count] of Object.entries(authorCounts)) {
        if (count > maxBlogs) {
            maxAuthor = author
            maxBlogs = count
        }
    }

    return {
        author: maxAuthor,
        blogs: maxBlogs
    }
}

const mostLikes = (blogs) => {
    if (blogs.length === 0) {
        return null
    }

    const authorLikes = {}

    blogs.forEach(blog => {
        authorLikes[blog.author] = (authorLikes[blog.author] || 0) + blog.likes
    })

    let maxAuthor = null
    let maxLikes = 0

    for (const [author, likes] of Object.entries(authorLikes)) {
        if (likes > maxLikes) {
            maxAuthor = author
            maxLikes = likes
        }
    }

    return {
        author: maxAuthor,
        likes: maxLikes
    }
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}