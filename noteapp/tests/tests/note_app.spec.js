const { test, describe, expect, beforeEach } = require('@playwright/test')
const { loginWith, createNote } = require('./helper')

describe('Note app', () => {
    beforeEach(async ({ page, request }) => {
        await request.post('/api/testing/reset')
        await request.post('/api/users', {
            data: {
                name: 'Matti Luukkainen',
                username: 'mluukkai',
                password: 'salainen'
            }
        })

        await page.goto('/')
    })

    test('front page can be opened', async ({ page }) => {
        const locator = await page.getByText('Notes')
        await expect(locator).toBeVisible()
        await expect(page.getByText('Note app, Department of Computer Science, University of Helsinki 2025')).toBeVisible()
    })

    test('login form can be opened', async ({ page }) => {
        await loginWith(page, 'mluukkai', 'salainen')
        await expect(page.getByText('Matti Luukkainen logged in')).toBeVisible()
    })

    test('login fails with wrong password', async ({ page }) => {
        await loginWith(page, 'mluukkai', 'wrong')

        const errorDiv = await page.locator('.error')
        await expect(errorDiv).toContainText('invalid username or password')
        await expect(errorDiv).toHaveCSS('border-style', 'solid')
        await expect(errorDiv).toHaveCSS('color', 'rgb(255, 0, 0)')

        await expect(page.getByText('Matti Luukkainen logged in')).not.toBeVisible()
    })

    describe('when logged in', () => {
        beforeEach(async ({ page }) => {
            await loginWith(page, 'mluukkai', 'salainen')
        })

        test('a new note can be created', async ({ page }) => {
            // Create a unique note with timestamp
            const noteText = `a note created by playwright ${Date.now()}`

            await createNote(page, noteText)

            // Use a more specific selector with waitFor to ensure the note appears
            await page.waitForSelector(`li.note:has-text("${noteText}")`)

            // Verify it's visible
            const noteElement = page.locator(`li.note:has-text("${noteText}")`)
            await expect(noteElement).toBeVisible()
        })

        describe('and several notes exist', () => {
            beforeEach(async ({ page }) => {
                // Create notes and wait for each to be rendered before creating the next one
                await createNote(page, 'first note')
                await createNote(page, 'second note')
                await createNote(page, 'third note')
            })

            test('importance can be changed for the second note', async ({ page }) => {
                // Debug - log the HTML structure of the notes section
                console.log('Notes HTML:', await page.locator('ul').innerHTML());

                // Get all notes
                const allNotes = await page.locator('li.note').all();
                console.log(`Found ${allNotes.length} notes on the page`);

                // Find the note that contains the text "second note"
                let secondNote = null;
                for (const note of allNotes) {
                    const text = await note.textContent();
                    if (text.includes('second note')) {
                        secondNote = note;
                        break;
                    }
                }

                // Make sure we found the second note
                expect(secondNote).not.toBeNull();

                // Find the button within this specific note element
                const button = await secondNote.getByRole('button');

                // Verify the button has the expected initial text
                expect(await button.textContent()).toBe('make not important');

                // Click the button
                await button.click();

                // Verify the button text has changed
                await expect(button).toHaveText('make important');
            })

            test('one of those can be made unimportant', async ({ page }) => {
                // Add pause here for interactive debugging
                // Uncomment the line below when you want to debug the test
                // await page.pause()

                // Get all notes
                const allNotes = await page.locator('li.note').all();

                // Find the note that contains the text "second note"
                let secondNote = null;
                for (const note of allNotes) {
                    const text = await note.textContent();
                    if (text.includes('second note')) {
                        secondNote = note;
                        break;
                    }
                }

                // Make sure we found the second note
                expect(secondNote).not.toBeNull();

                // Find the button within this specific note element
                const button = await secondNote.getByRole('button');

                // Click the button
                await button.click();

                // Verify the button text has changed
                await expect(button).toHaveText('make important');
            })
        })
    })
})