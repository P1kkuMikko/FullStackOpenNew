import axios from 'axios'
const baseUrl = '/api/notes'

let token = null

const setToken = newToken => {
    token = `Bearer ${newToken}`
}

// Helper function to check if the token is expired
const isTokenExpired = () => {
    if (!token) return true

    try {
        const tokenData = token.split(' ')[1]
        const payload = JSON.parse(atob(tokenData.split('.')[1]))
        const expTime = payload.exp * 1000 // Convert to milliseconds
        return Date.now() >= expTime
    } catch (error) {
        console.error('Error checking token expiration:', error)
        return true
    }
}

// Function to handle token expiration
const handleTokenExpiration = () => {
    if (isTokenExpired()) {
        window.localStorage.removeItem('loggedNoteappUser')
        token = null
        // Reload the page to reset the app state
        window.location.reload()
        return true
    }
    return false
}

const getAll = () => {
    const request = axios.get(baseUrl)
    return request.then((response) => response.data)
}

const create = async newObject => {
    if (handleTokenExpiration()) return null

    const config = {
        headers: { Authorization: token },
    }

    const response = await axios.post(baseUrl, newObject, config)
    return response.data
}

const update = async (id, newObject) => {
    if (handleTokenExpiration()) return null

    const config = {
        headers: { Authorization: token },
    }

    const response = await axios.put(`${baseUrl}/${id}`, newObject, config)
    return response.data
}

export default {
    getAll,
    create,
    update,
    setToken
}