import { combineReducers, configureStore } from '@reduxjs/toolkit';
import notes from './notesSlice';

const rootReducer = combineReducers({ notes });

export function createAppStore(preloadedState?: Partial<ReturnType<typeof rootReducer>>) {
  return configureStore({ reducer: rootReducer, preloadedState });
}

export type AppStore = ReturnType<typeof createAppStore>;
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = AppStore['dispatch'];
