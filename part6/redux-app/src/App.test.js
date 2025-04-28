import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import App from './App.jsx';
import noteReducer from './reducers/noteReducer';
import filterReducer from './reducers/filterReducer';

test('renders notes', () => {
  const store = configureStore({
    reducer: {
      notes: noteReducer,
      filter: filterReducer
    }
  });

  render(
    <Provider store={store}>
      <App />
    </Provider>
  );

  // Expecting the app to render rather than looking for "learn react"
  const element = screen.getByText(/notes/i, { exact: false });
  expect(element).toBeInTheDocument();
});
