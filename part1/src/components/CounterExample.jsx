import useCounter from '../hooks/useCounter';

const CounterExample = () => {
  const counter = useCounter();

  return (
    <div>
      <h2>Counter Example</h2>
      <div>{counter.value}</div>
      <button onClick={counter.increase}>plus</button>
      <button onClick={counter.decrease}>minus</button>
      <button onClick={counter.zero}>zero</button>
    </div>
  );
};

export default CounterExample;
