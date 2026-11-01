import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

function useRenderCount() {
  const countRef = useRef(0);
  const spanRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    countRef.current += 1;
    if (spanRef.current) spanRef.current.textContent = String(countRef.current);
  });
  return spanRef;
}

interface ChildProps {
  name: string;
  onPing: () => void;
}

function Counted({ name, onPing }: ChildProps) {
  const spanRef = useRenderCount();
  return (
    <li>
      {name}: rendered <span ref={spanRef} data-testid={`renders-${name}`}>0</span> times{' '}
      <button type="button" onClick={onPing}>
        Ping
      </button>
    </li>
  );
}

const MemoCounted = memo(Counted);

export function MemoDemo() {
  const [count, setCount] = useState(0);
  const [pings, setPings] = useState(0);
  const stablePing = useCallback(() => setPings((p) => p + 1), []);

  return (
    <div>
      <p>
        <button type="button" onClick={() => setCount((c) => c + 1)}>
          Re-render parent ({count})
        </button>{' '}
        Pings: {pings}
      </p>
      <ul className="plain">
        <Counted name="plain" onPing={stablePing} />
        <MemoCounted name="memo-inline-handler" onPing={() => setPings((p) => p + 1)} />
        <MemoCounted name="memo-useCallback" onPing={stablePing} />
      </ul>
    </div>
  );
}

function countPrimes(limit: number): number {
  const sieve = new Uint8Array(limit + 1);
  let count = 0;
  for (let i = 2; i <= limit; i++) {
    if (!sieve[i]) {
      count++;
      for (let j = i * i; j <= limit; j += i) sieve[j] = 1;
    }
  }
  return count;
}

export function UseMemoDemo() {
  const [limit, setLimit] = useState(200000);
  const [other, setOther] = useState(0);
  const calls = useRef(0);
  const primes = useMemo(() => {
    calls.current += 1;
    return countPrimes(limit);
  }, [limit]);
  const [shownCalls, setShownCalls] = useState(0);
  useEffect(() => setShownCalls(calls.current), [primes, other]);

  return (
    <div>
      <p className="row">
        <label htmlFor="limit">Count primes up to</label>
        <input id="limit" type="number" min={2} value={limit} onChange={(e) => setLimit(Math.max(2, Number(e.target.value) || 2))} />
      </p>
      <p>
        Primes: <strong data-testid="primes">{primes}</strong>. The calculation has run <strong data-testid="calls">{shownCalls}</strong> time(s).
      </p>
      <button type="button" onClick={() => setOther((o) => o + 1)}>
        Unrelated update ({other})
      </button>
    </div>
  );
}
