import { Suspense, lazy, useState } from 'react';
import { Demo } from '../components/Demo';
import { VirtualList } from '../perf/VirtualList';
import { Benchmark } from '../perf/Benchmark';
import { MemoDemo, UseMemoDemo } from '../perf/MemoDemo';

const HeavyPanel = lazy(() => import('../perf/HeavyPanel'));

function LazyDemo() {
  const [show, setShow] = useState(false);
  return (
    <div>
      <button type="button" onClick={() => setShow(true)} disabled={show}>
        Load panel
      </button>
      {show && (
        <Suspense fallback={<p role="status">Loading panel...</p>}>
          <HeavyPanel />
        </Suspense>
      )}
    </div>
  );
}

export function PerformancePage() {
  return (
    <>
      <h1>Performance</h1>
      <Demo
        title="memo and useCallback"
        when="A child is expensive or often re-rendered with the same props. memo only helps if the props are stable, so inline functions defeat it."
      >
        <MemoDemo />
      </Demo>
      <Demo title="useMemo" when="A calculation is slow and its inputs change less often than the component renders. Measure first; memoizing cheap work only adds cost.">
        <UseMemoDemo />
      </Demo>
      <Demo title="Code splitting with lazy and Suspense" when="A feature is large and not needed on first load, such as an editor or a chart. The routes of this app are split the same way.">
        <LazyDemo />
      </Demo>
      <Demo title="Virtualised list (10,000 rows)" when="A long list where most rows are off screen. Only the visible rows plus a small overscan are in the DOM.">
        <VirtualList total={10000} itemHeight={32} height={240} label="Ten thousand rows" renderItem={(i) => <span>Row {i + 1}</span>} />
      </Demo>
      <Demo title="Measured: slow against optimised" when="Before and after comparisons. This uses the React Profiler and performance.now. Results depend on the machine and browser.">
        <Benchmark />
      </Demo>
    </>
  );
}
