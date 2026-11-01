import { Profiler, memo, useMemo, useRef, useState, type ProfilerOnRenderCallback } from 'react';
import { flushSync } from 'react-dom';

type Variant = 'slow' | 'optimised';

export interface Result {
  actualMs: number;
  wallMs: number;
}

function makeItems(n: number): string[] {
  const items: string[] = [];
  for (let i = 0; i < n; i++) items.push(`Item ${((i * 7919) % n).toString(36)}-${i}`);
  return items;
}

function SlowList({ items }: { items: string[] }) {
  const sorted = [...items].sort((a, b) => a.localeCompare(b));
  return (
    <ul className="bench-list">
      {sorted.map((s) => (
        <SlowRow key={s} text={s} />
      ))}
    </ul>
  );
}

function SlowRow({ text }: { text: string }) {
  return <li>{text}</li>;
}

const Row = memo(function Row({ text }: { text: string }) {
  return <li>{text}</li>;
});

const FastList = memo(function FastList({ items }: { items: string[] }) {
  const sorted = useMemo(() => [...items].sort((a, b) => a.localeCompare(b)), [items]);
  return (
    <ul className="bench-list">
      {sorted.map((s) => (
        <Row key={s} text={s} />
      ))}
    </ul>
  );
});

function Host({ variant, items, tick, onRender }: { variant: Variant; items: string[]; tick: number; onRender: ProfilerOnRenderCallback }) {
  return (
    <Profiler id={variant} onRender={onRender}>
      <p>Parent ticks: {tick}</p>
      {variant === 'slow' ? <SlowList items={items} /> : <FastList items={items} />}
    </Profiler>
  );
}

interface BenchmarkProps {
  rows?: number;
  ticks?: number;
}

export function Benchmark({ rows = 1500, ticks = 30 }: BenchmarkProps) {
  const items = useMemo(() => makeItems(rows), [rows]);
  const [active, setActive] = useState<Variant | null>(null);
  const [tick, setTick] = useState(0);
  const [results, setResults] = useState<Partial<Record<Variant, Result>>>({});
  const [running, setRunning] = useState(false);
  const actual = useRef(0);

  const onRender: ProfilerOnRenderCallback = (_id, phase, actualDuration) => {
    if (phase === 'update') actual.current += actualDuration;
  };

  const measure = (variant: Variant): Result => {
    flushSync(() => {
      setActive(null);
      setTick(0);
    });
    flushSync(() => setActive(variant));
    actual.current = 0;
    const start = performance.now();
    for (let i = 1; i <= ticks; i++) flushSync(() => setTick(i));
    return { actualMs: actual.current, wallMs: performance.now() - start };
  };

  const run = async () => {
    setRunning(true);
    setResults({});
    await new Promise((r) => setTimeout(r, 0));
    const slow = measure('slow');
    await new Promise((r) => setTimeout(r, 0));
    const optimised = measure('optimised');
    flushSync(() => setActive(null));
    setResults({ slow, optimised });
    setRunning(false);
  };

  const fmt = (n: number) => n.toFixed(1);

  return (
    <div>
      <p>
        Each variant renders {rows} rows, then the parent state changes {ticks} times. The slow version re-sorts and re-renders every row on
        each change. The optimised version uses <code>memo</code> and <code>useMemo</code>, so only the parent text updates.
      </p>
      <button type="button" onClick={run} disabled={running}>
        {running ? 'Running...' : 'Run comparison'}
      </button>
      <div className="bench-stage" aria-hidden="true">
        {active && <Host variant={active} items={items} tick={tick} onRender={onRender} />}
      </div>
      {results.slow && results.optimised && (
        <table>
          <caption>Total for {ticks} parent updates (milliseconds)</caption>
          <thead>
            <tr>
              <th scope="col">Version</th>
              <th scope="col">Profiler actualDuration</th>
              <th scope="col">Wall time (performance.now)</th>
            </tr>
          </thead>
          <tbody>
            {(['slow', 'optimised'] as const).map((v) => (
              <tr key={v}>
                <th scope="row">{v}</th>
                <td data-testid={`${v}-actual`}>{fmt(results[v]!.actualMs)}</td>
                <td data-testid={`${v}-wall`}>{fmt(results[v]!.wallMs)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
