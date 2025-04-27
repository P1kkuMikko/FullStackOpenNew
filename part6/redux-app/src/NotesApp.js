import React from 'react'
import ReactDOM from 'react-dom/client'
import { createStore } from 'redux'
import noteReducer from './reducers/noteReducer'

const store = createStore(noteReducer)

const generateId = () => {
    return Math.floor(Math.random() * 1000000)
}

const NotesApp = () => {
    const addNote = (event) => {
        event.preventDefault()
        const content = event.target.note.value
        event.target.note.value = ''

        store.dispatch({
            type: 'NEW_NOTE',
            payload: {
                content,
                important: false,
                id: generateId()
            }
        })
    }

    const toggleImportance = (id) => {
        store.dispatch({
            type: 'TOGGLE_IMPORTANCE',
            payload: { id }
        })
    }

    return (
        <div>
            <h2>Notes</h2>
            <form onSubmit={addNote}>
                <input name="note" />
                <button type="submit">add</button>
            </form>
            <ul>
                {store.getState().map(note =>
                    <li key={note.id} onClick={() => toggleImportance(note.id)}>
                        {note.content}
                        <strong> {note.important ? 'important' : ''}</strong>
                    </li>
                )}
            </ul>
        </div>
    )
}

const renderApp = () => {
    ReactDOM.createRoot(document.getElementById('root')).render(<NotesApp />)
}

renderApp()
store.subscribe(renderApp)

export default NotesApp