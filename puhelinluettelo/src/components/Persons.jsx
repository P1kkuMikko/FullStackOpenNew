const Persons = ({ personsToShow, deletePerson }) => (
  <ul>
    {personsToShow.map((person, index) => (
      <li key={person.id || person._id || index}>
        {person.name} {person.number}
        <button onClick={() => deletePerson(person.id || person._id, person.name)}>delete</button>
      </li>
    ))}
  </ul>
);

export default Persons;
