import { useState, useEffect } from 'react';
import Filter from './components/Filter';
import PersonForm from './components/PersonForm';
import Persons from './components/Persons';
import personService from './services/persons';

const Notification = ({ message, type }) => {
  if (message === null) {
    return null;
  }

  return (
    <div className={type}>
      {message}
    </div>
  );
};

const App = () => {
  const [persons, setPersons] = useState([]);
  const [newName, setNewName] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [filter, setFilter] = useState('');
  const [notification, setNotification] = useState({ message: null, type: null });

  useEffect(() => {
    personService
      .getAll()
      .then(initialPersons => {
        setPersons(initialPersons);
      });
  }, []);

  const handleNameChange = (event) => {
    setNewName(event.target.value);
  };

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value);
  };

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const addPerson = (event) => {
    event.preventDefault();
    const newPerson = { name: newName, number: newNumber };

    personService
      .create(newPerson)
      .then(response => {
        setPersons(persons.map(person => person.id === response.id ? response : person).concat(response));
        setNotification({ message: `Added or updated ${newName}`, type: 'success' });
        setTimeout(() => setNotification({ message: null, type: null }), 5000);
        setNewName('');
        setNewNumber('');
      })
      .catch(error => {
        if (error.response?.status === 409) {
          setNotification({ message: `Updated ${newName}'s number`, type: 'success' });
        } else {
          setNotification({ message: error.response?.data?.error || `Failed to add ${newName}`, type: 'error' });
        }
        setTimeout(() => setNotification({ message: null, type: null }), 5000);
      });
  };

  const deletePerson = (id, name) => {
    if (window.confirm(`Delete ${name}?`)) {
      personService
        .remove(id)
        .then(() => {
          setPersons(persons.filter(person => person.id !== id));
          setNotification({ message: `Deleted ${name}`, type: 'success' });
          setTimeout(() => setNotification({ message: null, type: null }), 5000);
        })
        .catch(error => {
          setNotification({ message: `Information of ${name} has already been removed from the server`, type: 'error' });
          setTimeout(() => setNotification({ message: null, type: null }), 5000);
          setPersons(persons.filter(person => person.id !== id));
        });
    }
  };

  const personsToShow = filter
    ? persons.filter(person =>
        person.name.toLowerCase().includes(filter.toLowerCase())
      )
    : persons;

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={notification.message} type={notification.type} />
      <Filter filter={filter} handleFilterChange={handleFilterChange} />
      <h3>Add a new</h3>
      <PersonForm
        addPerson={addPerson}
        newName={newName}
        handleNameChange={handleNameChange}
        newNumber={newNumber}
        handleNumberChange={handleNumberChange}
      />
      <h3>Numbers</h3>
      <Persons personsToShow={personsToShow} deletePerson={deletePerson} />
    </div>
  );
};

export default App;