import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { HomePage } from './pages/HomePage';

const StatePage = lazy(() => import('./pages/StatePage').then((m) => ({ default: m.StatePage })));
const ContextPage = lazy(() => import('./pages/ContextPage').then((m) => ({ default: m.ContextPage })));
const HooksPage = lazy(() => import('./pages/HooksPage').then((m) => ({ default: m.HooksPage })));
const FormsPage = lazy(() => import('./pages/FormsPage').then((m) => ({ default: m.FormsPage })));
const ReduxPage = lazy(() => import('./pages/ReduxPage').then((m) => ({ default: m.ReduxPage })));
const PerformancePage = lazy(() => import('./pages/PerformancePage').then((m) => ({ default: m.PerformancePage })));
const ErrorsA11yPage = lazy(() => import('./pages/ErrorsA11yPage').then((m) => ({ default: m.ErrorsA11yPage })));

function NotFound() {
  return (
    <>
      <h1>Page not found</h1>
      <p>There is no demo at this address. Use the menu to pick one.</p>
    </>
  );
}

export function App() {
  return (
    <ErrorBoundary label="app">
      <Suspense fallback={<p role="status" className="route-loading">Loading...</p>}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="state" element={<StatePage />} />
            <Route path="context" element={<ContextPage />} />
            <Route path="hooks" element={<HooksPage />} />
            <Route path="forms" element={<FormsPage />} />
            <Route path="redux" element={<ReduxPage />} />
            <Route path="performance" element={<PerformancePage />} />
            <Route path="errors-a11y" element={<ErrorsA11yPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
