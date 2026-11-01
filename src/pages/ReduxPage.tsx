import { useState, type FormEvent } from 'react';
import { Provider } from 'react-redux';
import { Demo } from '../components/Demo';
import { createAppStore } from '../store/store';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loadNotes, noteAdded, noteRemoved } from '../store/notesSlice';

function Notes() {
  const dispatch = useAppDispatch();
  const { items, status, error } = useAppSelector((s) => s.notes);
  const [text, setText] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    dispatch(noteAdded(text));
    setText('');
  };

  return (
    <div>
      <p className="row">
        <button type="button" onClick={() => dispatch(loadNotes())} disabled={status === 'loading'}>
          Load notes
        </button>
        <button type="button" onClick={() => dispatch(loadNotes({ fail: true }))} disabled={status === 'loading'}>
          Load and fail
        </button>
      </p>
      <p>
        Status: <strong data-testid="status">{status}</strong>
      </p>
      {error && <p role="alert">Error: {error}</p>}
      <ul className="plain" aria-label="Notes">
        {items.map((n) => (
          <li key={n.id}>
            {n.text}{' '}
            <button type="button" onClick={() => dispatch(noteRemoved(n.id))} aria-label={`Delete note ${n.id}`}>
              Delete
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={submit} className="row">
        <label htmlFor="note-text">New note</label>
        <input id="note-text" value={text} onChange={(e) => setText(e.target.value)} />
        <button type="submit">Add note</button>
      </form>
    </div>
  );
}

export function ReduxPage() {
  // A store per page keeps this demo self contained; a real app creates one store at the root.
  const [store] = useState(() => createAppStore());
  return (
    <>
      <h1>Redux Toolkit</h1>
      <Demo
        title="Slice, typed store and async thunk"
        when="State that many parts of the app share, with several update paths and async loading. For state used by one component, useState or useReducer is simpler."
      >
        <Provider store={store}>
          <Notes />
        </Provider>
      </Demo>
      <Demo title="Where the code is" when="Read in this order: mockApi, notesSlice, store, hooks.">
        <ul>
          <li><code>src/store/notesSlice.ts</code>: createSlice, createAsyncThunk and the pending, fulfilled and rejected cases</li>
          <li><code>src/store/store.ts</code>: configureStore through a factory, plus RootState and AppDispatch types</li>
          <li><code>src/store/hooks.ts</code>: typed useAppDispatch and useAppSelector</li>
        </ul>
      </Demo>
    </>
  );
}
