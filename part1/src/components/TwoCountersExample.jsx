import useCounter from '../hooks/useCounter';

const TwoCountersExample = () => {
  const left = useCounter();
  const right = useCounter();

  return (
    <div>
      <h2>Two Counters Example</h2>
      <div>
        {left.value}
        <button onClick={left.increase}>left</button>
        <button onClick={right.increase}>right</button>
        {right.value}
      </div>
    </div>
  );
};

export default TwoCountersExample;
