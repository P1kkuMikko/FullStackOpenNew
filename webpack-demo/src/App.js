import React, { useState, lazy, Suspense } from 'react'
import useNotes from './hooks/useNotes'

// Dynamic imports using React.lazy
const NotesList = lazy(() => import('./components/NotesList'))
const Counter = lazy(() => import('./components/Counter'))

const App = () => {
    const notes = useNotes(BACKEND_URL)
    const [showNotes, setShowNotes] = useState(false)
    const [showCounter, setShowCounter] = useState(false)

    return (
        <div className="container">
            <h1>Webpack Demo with Code Splitting</h1>
            <div>Notes data source: {BACKEND_URL}</div>

            <div style={{ marginTop: 20, marginBottom: 20 }}>
                <button onClick={() => setShowNotes(!showNotes)}>
                    {showNotes ? 'Hide Notes' : 'Show Notes'}
                </button>
                {' '}
                <button onClick={() => setShowCounter(!showCounter)}>
                    {showCounter ? 'Hide Counter' : 'Show Counter'}
                </button>
            </div>

            {/* Loading indicator while components are being fetched */}
            <Suspense fallback={<div>Loading...</div>}>
                {showNotes && <NotesList notes={notes} />}
                {showCounter && <Counter />}
            </Suspense>
        </div>
    )
}

export default App