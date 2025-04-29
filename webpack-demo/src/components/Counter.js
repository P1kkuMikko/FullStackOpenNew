import React, { useState } from 'react'

const Counter = () => {
    const [counter, setCounter] = useState(0)
    const [values, setValues] = useState([])

    const handleClick = () => {
        setCounter(counter + 1)
        setValues(values.concat(counter))
    }

    return (
        <div>
            <h2>Counter</h2>
            <div>
                counter: {counter} clicks
                <button onClick={handleClick}>
                    press
                </button>
            </div>
            <div>
                {values.length > 0 && <div>button press history: {values.join(' ')}</div>}
            </div>
        </div>
    )
}

export default Counter