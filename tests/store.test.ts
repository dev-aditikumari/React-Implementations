import reducer, { initialState, loadNotes, noteAdded, noteRemoved } from '../src/store/notesSlice';
import { createAppStore } from '../src/store/store';

describe('notes slice reducers', () => {
  it('adds a trimmed note with the next id', () => {
    const state = reducer({ ...initialState, items: [{ id: 4, text: 'x' }] }, noteAdded('  hello '));
    expect(state.items).toEqual([
      { id: 4, text: 'x' },
      { id: 5, text: 'hello' },
    ]);
  });

  it('ignores blank notes', () => {
    expect(reducer(initialState, noteAdded('  ')).items).toEqual([]);
  });

  it('removes by id', () => {
    const state = reducer({ ...initialState, items: [{ id: 1, text: 'a' }, { id: 2, text: 'b' }] }, noteRemoved(1));
    expect(state.items).toEqual([{ id: 2, text: 'b' }]);
  });
});

describe('loadNotes thunk states', () => {
  it('sets loading on pending and clears an old error', () => {
    const state = reducer({ ...initialState, status: 'failed', error: 'old' }, loadNotes.pending('id', undefined));
    expect(state.status).toBe('loading');
    expect(state.error).toBeNull();
  });

  it('stores items on fulfilled', () => {
    const state = reducer(initialState, loadNotes.fulfilled([{ id: 1, text: 'a' }], 'id', undefined));
    expect(state.status).toBe('succeeded');
    expect(state.items).toHaveLength(1);
  });

  it('stores the rejected message', () => {
    const state = reducer(initialState, loadNotes.rejected(null, 'id', undefined, 'nope'));
    expect(state.status).toBe('failed');
    expect(state.error).toBe('nope');
  });

  it('runs end to end against the mock: loading then succeeded', async () => {
    const store = createAppStore();
    const promise = store.dispatch(loadNotes({ delayMs: 0 }));
    expect(store.getState().notes.status).toBe('loading');
    await promise;
    expect(store.getState().notes.status).toBe('succeeded');
    expect(store.getState().notes.items.length).toBeGreaterThan(0);
  });

  it('runs end to end against the mock: failure', async () => {
    const store = createAppStore();
    await store.dispatch(loadNotes({ delayMs: 0, fail: true }));
    expect(store.getState().notes.status).toBe('failed');
    expect(store.getState().notes.error).toMatch(/refused/);
  });
});
