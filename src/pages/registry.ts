export interface PageInfo {
  path: string;
  title: string;
  summary: string;
  file: string;
}

export const pages: PageInfo[] = [
  { path: '/state', title: 'State', summary: 'useState and useReducer with typed actions: a todo list and a shopping cart.', file: 'src/pages/StatePage.tsx' },
  { path: '/context', title: 'Context API', summary: 'Typed theme and auth providers, and hooks that throw outside their provider.', file: 'src/pages/ContextPage.tsx' },
  { path: '/hooks', title: 'Custom hooks', summary: 'useFetch, useDebounce, useLocalStorage, useOnClickOutside and usePrevious.', file: 'src/pages/HooksPage.tsx' },
  { path: '/forms', title: 'Forms', summary: 'Controlled and uncontrolled forms with validation and accessible errors.', file: 'src/pages/FormsPage.tsx' },
  { path: '/redux', title: 'Redux Toolkit', summary: 'createSlice, a typed store, typed hooks and an async thunk against a local mock.', file: 'src/pages/ReduxPage.tsx' },
  { path: '/performance', title: 'Performance', summary: 'memo, useMemo, useCallback, lazy loading, a hand-written virtual list and a measured comparison.', file: 'src/pages/PerformancePage.tsx' },
  { path: '/errors-a11y', title: 'Errors and accessibility', summary: 'Error boundaries, Suspense fallbacks, focus management and aria.', file: 'src/pages/ErrorsA11yPage.tsx' },
];
