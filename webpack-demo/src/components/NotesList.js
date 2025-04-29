import React from 'react'

const NotesList = ({ notes }) => {
    return (
        <>
            <h2>Notes</h2>
            <div>{notes.length} notes loaded</div>
            <ul>
                {notes.map(note =>
                    <li key={note.id}>{note.content}</li>
                )}
            </ul>
        </>
    )
}

export default NotesList