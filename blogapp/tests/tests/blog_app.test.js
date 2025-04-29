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
            const errorDiv = page.locator('.notification')
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

            // Wait for blog to be created and appear on the page
            await page.waitForTimeout(1000)

            // Find and click the first view button
            const viewButtons = await page.getByRole('button', { name: 'view' }).all()
            await viewButtons[0].click()

            // Count blogs before deletion
            const blogCountBefore = await page.locator('.blog').count()

            // Click the remove button and handle the confirmation dialog
            page.on('dialog', dialog => dialog.accept())
            await page.getByRole('button', { name: 'remove' }).first().click()

            // Wait for deletion
            await page.waitForTimeout(1000)

            // Verify the blog count decreased by 1
            const blogCountAfter = await page.locator('.blog').count()
            expect(blogCountAfter).toBe(blogCountBefore - 1)
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

            // Find and click the first view button
            const viewButtons = await page.getByRole('button', { name: 'view' }).all()
            await viewButtons[0].click()

            // Verify the remove button is visible for creator
            await expect(page.getByRole('button', { name: 'remove' }).first()).toBeVisible()

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

            // Find and click the first view button
            await page.waitForTimeout(1000)
            const newViewButtons = await page.getByRole('button', { name: 'view' }).all()
            await newViewButtons[0].click()

            // Verify the remove button is not visible for non-creator
            await expect(page.getByRole('button', { name: 'remove' })).not.toBeVisible()
        })

        test('blogs are ordered by likes', async ({ page }) => {
            // 5.23: Test blog ordering by likes
            // Reset and create blogs with unique titles to avoid selector issues
            const uniqueId = Date.now().toString();
            const blogs = [
                { title: `Least Liked Blog ${uniqueId}`, author: 'Author 1', url: 'http://url1.com', likes: 5 },
                { title: `Most Liked Blog ${uniqueId}`, author: 'Author 2', url: 'http://url2.com', likes: 15 },
                { title: `Medium Liked Blog ${uniqueId}`, author: 'Author 3', url: 'http://url3.com', likes: 10 }
            ];

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
                });
            }

            // Reload the page to see all blogs
            await page.reload();

            // Wait for blogs to load
            await page.waitForTimeout(1000);

            // Instead of trying to expand all blogs, let's get the blog elements directly
            const blogElements = await page.locator('.blog').all();
            console.log(`Found ${blogElements.length} blogs on page`);
            
            // Collect all blog headers to find our test blogs
            const allBlogHeaders = [];
            for (let i = 0; i < blogElements.length; i++) {
                const headerText = await blogElements[i].locator('.blog-header').innerText();
                allBlogHeaders.push({
                    index: i,
                    text: headerText
                });
            }
            
            console.log('All blog headers:', allBlogHeaders);
            
            // Find our test blogs by their unique titles
            const testBlogs = [];
            for (const blog of blogs) {
                for (const header of allBlogHeaders) {
                    if (header.text.includes(blog.title)) {
                        testBlogs.push({
                            title: blog.title,
                            index: header.index,
                            likes: blog.likes
                        });
                        break;
                    }
                }
            }
            
            console.log('Found test blogs:', testBlogs);
            
            // Sort the test blogs by likes in descending order
            const expectedOrder = [...testBlogs].sort((a, b) => b.likes - a.likes);
            console.log('Expected order by likes:', expectedOrder.map(b => b.title));
            
            // Get the actual order from the page
            const actualOrder = [...testBlogs].sort((a, b) => a.index - b.index);
            console.log('Actual order on page:', actualOrder.map(b => b.title));
            
            // Check if the blogs are displayed in descending order of likes
            const expectedTitles = expectedOrder.map(blog => blog.title);
            const actualTitles = actualOrder.map(blog => blog.title);
            
            // The blogs should be in descending order by likes
            expect(actualTitles).toEqual(expectedTitles);
        })

        // New tests for Users view
        describe('Users view', () => {
            test('navigation link to Users view is visible', async ({ page }) => {
                // Check that the navigation link to Users exists
                await expect(page.getByRole('link', { name: 'users' })).toBeVisible()
            })

            test('clicking users link navigates to Users view', async ({ page }) => {
                // Click the users link in navigation
                await page.getByRole('link', { name: 'users' }).click()

                // Verify we're on the users page
                await expect(page.getByRole('heading', { level: 2, name: 'Users' })).toBeVisible()
                await expect(page.getByText('blogs created')).toBeVisible()
            })

            test('Users view shows correct user information', async ({ page, request }) => {
                // Create another user with blogs
                await request.post('http://localhost:3003/api/users', {
                    data: {
                        name: 'Test User',
                        username: 'testuser',
                        password: 'testpassword'
                    }
                })

                // Login as the newly created user
                await page.getByRole('button', { name: 'logout' }).click()
                await page.locator('input[name="Username"]').fill('testuser')
                await page.locator('input[name="Password"]').fill('testpassword')
                await page.getByRole('button', { name: 'login' }).click()

                // Create some blogs for this user
                await page.getByRole('button', { name: 'create new blog' }).click()
                await page.locator('input[name="Title"]').fill('Test Blog 1')
                await page.locator('input[name="Author"]').fill('Test Author')
                await page.locator('input[name="Url"]').fill('http://test1.com')
                await page.getByRole('button', { name: 'create' }).click()
                await page.waitForTimeout(500)

                await page.getByRole('button', { name: 'create new blog' }).click()
                await page.locator('input[name="Title"]').fill('Test Blog 2')
                await page.locator('input[name="Author"]').fill('Test Author')
                await page.locator('input[name="Url"]').fill('http://test2.com')
                await page.getByRole('button', { name: 'create' }).click()
                await page.waitForTimeout(500)

                // Navigate to Users view
                await page.getByRole('link', { name: 'users' }).click()

                // Wait longer for the users data to load
                await page.waitForTimeout(1000)

                try {
                    // First check if the users-table element exists
                    await expect(page.getByTestId('users-table')).toBeVisible({ timeout: 5000 })

                    // Get the table rows
                    const tableRows = await page.getByTestId('users-table').locator('tr').all()
                    console.log(`Found ${tableRows.length} total rows in table`)

                    // Verify we have at least two rows (header + at least one data row)
                    expect(tableRows.length).toBeGreaterThan(1)

                    // Check for Test User using a more specific selector
                    // Look for a table cell containing exactly "Test User"
                    const userCell = page.getByRole('cell', { name: 'Test User', exact: true })
                    await expect(userCell).toBeVisible()

                    // Find the row containing Test User and check that it shows a number of blogs
                    const userRow = page.locator('tr:has(td:text("Test User"))')
                    const rowText = await userRow.innerText()
                    
                    // Extract the number of blogs from the row text
                    const blogCount = parseInt(rowText.split('\t')[1]) || 0
                    
                    // Just verify the user has at least some blogs
                    console.log(`Test User has ${blogCount} blogs`)
                    expect(blogCount).toBeGreaterThan(0)

                } catch (error) {
                    // Screenshot on error for debugging
                    await page.screenshot({ path: 'users-view-error.png' })
                    throw error
                }
            })
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