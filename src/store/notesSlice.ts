import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { fetchNotesFromMock, type MockOptions, type Note } from './mockApi';

export interface NotesState {
  items: Note[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

export const initialState: NotesState = { items: [], status: 'idle', error: null };

export const loadNotes = createAsyncThunk<Note[], MockOptions | undefined, { rejectValue: string }>(
  'notes/load',
  async (options, { rejectWithValue }) => {
    try {
      return await fetchNotesFromMock(options);
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to load');
    }
  },
);

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    noteAdded(state, action: PayloadAction<string>) {
      const text = action.payload.trim();
      if (!text) return;
      const id = state.items.reduce((max, n) => Math.max(max, n.id), 0) + 1;
      state.items.push({ id, text });
    },
    noteRemoved(state, action: PayloadAction<number>) {
      state.items = state.items.filter((n) => n.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadNotes.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loadNotes.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(loadNotes.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? action.error.message ?? 'Failed to load';
      });
  },
});

export const { noteAdded, noteRemoved } = notesSlice.actions;
export default notesSlice.reducer;
