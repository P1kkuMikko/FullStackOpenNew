const { test, expect, beforeEach, describe } = require('@playwright/test')

describe('Blog app', () => {
    beforeEach(async ({ page, request }) => {
        await request.post('http://localhost:3003/api/testing/reset')
        await request.post('http://localhost:3003/api/users', {
            data: {
                name: 'Matti Luukkainen',
                username: 'mluukkai',
                password: 'salainen'
            }
        })

        await page.goto('http://localhost:5173')
    })

    test('Login form is shown', async ({ page }) => {
        // 5.17: Test that login form is shown by default
        await expect(page.getByText('Log in to application')).toBeVisible()
        await expect(page.getByText('username')).toBeVisible()
        await expect(page.locator('input[name="Username"]')).toBeVisible()
        await expect(page.getByText('password')).toBeVisible()
        await expect(page.locator('input[name="Password"]')).toBeVisible()
        await expect(page.getByRole('button', { name: 'login' })).toBeVisible()
    })

    describe('Login', () => {
        test('succeeds with correct credentials', async ({ page }) => {
            // 5.18: Test successful login
            await page.locator('input[name="Username"]').fill('mluukkai')
            await page.locator('input[name="Password"]').fill('salainen')
            await page.getByRole('button', { name: 'login' }).click()

            // Check that user is logged in
            await expect(page.getByText('Matti Luukkainen logged in')).toBeVisible()
        })

        test('fails with wrong credentials', async ({ page }) => {
            // 5.18: Test failed login
            await page.locator('input[name="Username"]').fill('mluukkai')
            await page.locator('input[name="Password"]').fill('wrong')
            await page.getByRole('button', { name: 'login' }).click()

            // Check for error notification
            const errorDiv = page.locator('.error')
            await expect(errorDiv).toBeVisible()
            await expect(errorDiv).toHaveText(/wrong username or password/i)

            // Verify still on login form
            await expect(page.getByText('Matti Luukkainen logged in')).not.toBeVisible()
        })
    })

    describe('When logged in', () => {
        beforeEach(async ({ page }) => {
            // Login before each test in this block
            await page.locator('input[name="Username"]').fill('mluukkai')
            await page.locator('input[name="Password"]').fill('salainen')
            await page.getByRole('button', { name: 'login' }).click()

            // Verify login was successful
            await expect(page.getByText('Matti Luukkainen logged in')).toBeVisible()
        })

        test('a new blog can be created', async ({ page }) => {
            // 5.19: Test blog creation
            await page.getByRole('button', { name: 'create new blog' }).click()

            await page.locator('input[name="Title"]').fill('Test Blog Title')
            await page.locator('input[name="Author"]').fill('Test Author')
            await page.locator('input[name="Url"]').fill('http://testurl.com')
            await page.getByRole('button', { name: 'create' }).click()

            // Wait for blog to be created
            await page.waitForTimeout(1000)

            // Check that the blog appears in the list - looking at the blog-header class
            await expect(page.locator('.blog-header').filter({ hasText: 'Test Blog Title Test Author' }).first()).toBeVisible()
        })

        test('a blog can be liked', async ({ page }) => {
            // 5.20: Test liking a blog
            // First create a blog
            await page.getByRole('button', { name: 'create new blog' }).click()
            await page.locator('input[name="Title"]').fill('Likeable Blog')
            await page.locator('input[name="Author"]').fill('Like Author')
            await page.locator('input[name="Url"]').fill('http://like-url.com')
            await page.getByRole('button', { name: 'create' }).click()

            // Wait for blog to be created
            await page.waitForTimeout(1000)

            // Find the blog and expand it
            const blogHeader = page.locator('.blog-header').filter({ hasText: 'Likeable Blog Like Author' }).first()
            await blogHeader.getByRole('button').click()

            // Get initial likes count, like the blog, and check that likes increased
            const likesText = page.locator('.likes').first()

            // Get initial likes number
            const initialLikesText = await likesText.innerText()
            const initialLikes = parseInt(initialLikesText.split(' ')[1])

            // Click the like button
            await page.locator('.blog-details button').filter({ hasText: 'like' }).first().click()

            // Wait for like to be registered
            await page.waitForTimeout(500)

            // Check that likes increased by 1
            await expect(likesText).toContainText(`likes ${initialLikes + 1}`)
        })

        test('blog creator can delete the blog', async ({ page }) => {
            // 5.21: Test blog deletion
            // First create a blog
            await page.getByRole('button', { name: 'create new blog' }).click()
            await page.locator('input[name="Title"]').fill('Blog to Delete')
            await page.locator('input[name="Author"]').fill('Delete Author')
            await page.locator('input[name="Url"]').fill('http://delete-url.com')
            await page.getByRole('button', { name: 'create' }).click()

            // Wait for blog to be created
            await page.waitForTimeout(1000)

            // Find the blog and expand it
            const blogHeader = page.locator('.blog-header').filter({ hasText: 'Blog to Delete Delete Author' }).first()
            await blogHeader.getByRole('button').click()

            // Count blogs before deletion
            const blogCountBefore = await page.locator('.blog').count()

            // Click the remove button and handle the confirmation dialog
            page.on('dialog', dialog => dialog.accept())
            await page.getByRole('button', { name: 'remove' }).click()

            // Wait for deletion
            await page.waitForTimeout(500)

            // Verify the blog count decreased by 1
            await expect(page.locator('.blog')).toHaveCount(blogCountBefore - 1)
        })

        test('only the creator can see the delete button', async ({ page, request }) => {
            // 5.22: Test that only creator can see delete button
            // First create a blog as the first user
            await page.getByRole('button', { name: 'create new blog' }).click()
            await page.locator('input[name="Title"]').fill('Creator Only Blog')
            await page.locator('input[name="Author"]').fill('Creator Author')
            await page.locator('input[name="Url"]').fill('http://creator-url.com')
            await page.getByRole('button', { name: 'create' }).click()

            // Wait for blog to be created
            await page.waitForTimeout(1000)

            // Find the blog and expand it
            const blogHeader = page.locator('.blog-header').filter({ hasText: 'Creator Only Blog Creator Author' }).first()
            await blogHeader.getByRole('button').click()

            // Verify the remove button is visible for creator
            await expect(page.getByRole('button', { name: 'remove' })).toBeVisible()

            // Logout
            await page.getByRole('button', { name: 'logout' }).click()

            // Create another user
            await request.post('http://localhost:3003/api/users', {
                data: {
                    name: 'Another User',
                    username: 'anotheruser',
                    password: 'anotherpassword'
                }
            })

            // Login as the other user
            await page.locator('input[name="Username"]').fill('anotheruser')
            await page.locator('input[name="Password"]').fill('anotherpassword')
            await page.getByRole('button', { name: 'login' }).click()

            // Find and view the blog again
            const blogHeaderAsNewUser = page.locator('.blog-header').filter({ hasText: 'Creator Only Blog Creator Author' }).first()
            await blogHeaderAsNewUser.getByRole('button').click()

            // Verify the remove button is not visible for non-creator
            await expect(page.getByRole('button', { name: 'remove' })).not.toBeVisible()
        })

        test('blogs are ordered by likes', async ({ page }) => {
            // 5.23: Test blog ordering by likes
            // Create three blogs with different like counts
            const blogs = [
                { title: 'Least Liked Blog', author: 'Author 1', url: 'http://url1.com', likes: 5 },
                { title: 'Most Liked Blog', author: 'Author 2', url: 'http://url2.com', likes: 15 },
                { title: 'Medium Liked Blog', author: 'Author 3', url: 'http://url3.com', likes: 10 }
            ]

            // Create the blogs via API for efficiency and control over like count
            for (const blog of blogs) {
                await page.request.post('http://localhost:3003/api/blogs', {
                    data: {
                        title: blog.title,
                        author: blog.author,
                        url: blog.url,
                        likes: blog.likes,
                    },
                    headers: {
                        Authorization: `Bearer ${await getToken(page)}`
                    }
                })
            }

            // Reload the page to see all blogs
            await page.reload()

            // Wait for blogs to load
            await page.waitForTimeout(1000)

            // Only click view buttons for our specific blogs
            for (const blog of blogs) {
                const blogHeader = page.locator('.blog-header').filter({ hasText: `${blog.title} ${blog.author}` }).first()
                await blogHeader.getByRole('button', { name: 'view' }).click()
                // Add small delay between clicks to let UI update
                await page.waitForTimeout(100)
            }

            // Get all like counts from visible blog details
            const likesElements = await page.locator('.likes').all()
            const likeCounts = await Promise.all(
                likesElements.map(async (element) => {
                    const text = await element.innerText()
                    return parseInt(text.split(' ')[1])
                })
            )

            // Sort the like counts in descending order
            const sortedLikes = [...likeCounts].sort((a, b) => b - a)

            // Verify the likes are already in descending order
            expect(likeCounts).toEqual(sortedLikes)
        })
    })
})

// Helper function to get auth token
async function getToken(page) {
    const response = await page.request.post('http://localhost:3003/api/login', {
        data: {
            username: 'mluukkai',
            password: 'salainen'
        }
    })

    const data = await response.json()
    return data.token
}