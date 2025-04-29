import { useState } from 'react';
import CounterExample from './components/CounterExample';
import TwoCountersExample from './components/TwoCountersExample';
import FormExample from './components/FormExample';

const App = () => {
  const [page, setPage] = useState('counter');

  const toPage = (page) => () => {
    setPage(page);
  };

  const content = () => {
    if (page === 'counter') {
      return <CounterExample />;
    } else if (page === 'twoCounters') {
      return <TwoCountersExample />;
    } else if (page === 'form') {
      return <FormExample />;
    }
  };

  const padding = {
    padding: 5,
  };

  return (
    <div>
      <h1>Custom Hooks Examples</h1>
      <div>
        <button style={padding} onClick={toPage('counter')}>
          Counter
        </button>
        <button style={padding} onClick={toPage('twoCounters')}>
          Two Counters
        </button>
        <button style={padding} onClick={toPage('form')}>
          Form
        </button>
      </div>
      {content()}
    </div>
  );
};

export default App;
