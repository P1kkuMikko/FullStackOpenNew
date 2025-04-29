import useField from '../hooks/useField';

const FormExample = () => {
  const name = useField('text');
  const born = useField('date');
  const height = useField('number');

  return (
    <div>
      <h2>Form Example</h2>
      <form>
        name:
        <input {...name} />
        <br />
        birthdate:
        <input {...born} />
        <br />
        height:
        <input {...height} />
      </form>
      <div>
        <h3>Form Data:</h3>
        <p>Name: {name.value}</p>
        <p>Birthdate: {born.value}</p>
        <p>Height: {height.value}</p>
      </div>
    </div>
  );
};

export default FormExample;
