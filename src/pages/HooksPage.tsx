import { useRef, useState } from 'react';
import { Demo } from '../components/Demo';
import { useFetch } from '../hooks/useFetch';
import { useDebounce } from '../hooks/useDebounce';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useOnClickOutside } from '../hooks/useOnClickOutside';
import { usePrevious } from '../hooks/usePrevious';

interface Product {
  id: number;
  name: string;
  price: number;
}

function FetchDemo() {
  const [file, setFile] = useState('products');
  const { data, error, loading, refetch } = useFetch<Product[]>(`data/${file}.json`);
  return (
    <div>
      <p className="row">
        <label htmlFor="fetch-file">File</label>
        <select id="fetch-file" value={file} onChange={(e) => setFile(e.target.value)}>
          <option value="products">products.json (exists)</option>
          <option value="missing">missing.json (404)</option>
        </select>
        <button type="button" onClick={refetch}>
          Reload
        </button>
      </p>
      <div aria-live="polite">
        {loading && <p>Loading...</p>}
        {error && <p role="alert">Error: {error}</p>}
        {!loading && !error && data && (
          <ul className="plain">
            {data.map((p) => (
              <li key={p.id}>
                {p.name}: ${p.price.toFixed(2)}
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="hint">Changing the file or leaving the page aborts the request that is still running.</p>
    </div>
  );
}

function DebounceDemo() {
  const [text, setText] = useState('');
  const debounced = useDebounce(text, 400);
  return (
    <div>
      <p className="row">
        <label htmlFor="debounce-input">Search</label>
        <input id="debounce-input" value={text} onChange={(e) => setText(e.target.value)} />
      </p>
      <p>
        Typed: <code>{text}</code>
      </p>
      <p>
        Debounced (400 ms): <code data-testid="debounced">{debounced}</code>
      </p>
    </div>
  );
}

function StorageDemo() {
  const [note, setNote] = useLocalStorage('react-implementations:note', '');
  return (
    <p className="row">
      <label htmlFor="storage-input">Note (saved in this browser)</label>
      <input id="storage-input" value={note} onChange={(e) => setNote(e.target.value)} />
    </p>
  );
}

function OutsideDemo() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOnClickOutside(ref, () => setOpen(false));
  return (
    <div ref={ref} className="menu">
      <button type="button" aria-expanded={open} aria-controls="outside-menu" onClick={() => setOpen((o) => !o)}>
        Menu
      </button>
      {open && (
        <ul id="outside-menu" className="menu-list">
          <li>Profile</li>
          <li>Settings</li>
        </ul>
      )}
    </div>
  );
}

function PreviousDemo() {
  const [n, setN] = useState(0);
  const previous = usePrevious(n);
  return (
    <p>
      Now: <strong>{n}</strong>, before: <strong data-testid="previous">{previous ?? 'none'}</strong>{' '}
      <button type="button" onClick={() => setN((v) => v + 1)}>
        Add one
      </button>
    </p>
  );
}

export function HooksPage() {
  return (
    <>
      <h1>Custom hooks</h1>
      <Demo title="useFetch" when="Loading data on mount or when an input changes. It tracks loading and error states and aborts stale requests.">
        <FetchDemo />
      </Demo>
      <Demo title="useDebounce" when="Delay work such as a search request until the user stops typing.">
        <DebounceDemo />
      </Demo>
      <Demo title="useLocalStorage" when="Small preferences that should survive a reload. It falls back to memory if storage is blocked.">
        <StorageDemo />
      </Demo>
      <Demo title="useOnClickOutside" when="Close menus, popovers and dialogs when the user clicks elsewhere.">
        <OutsideDemo />
      </Demo>
      <Demo title="usePrevious" when="Compare the current value with the one from the last render, for example to show a change.">
        <PreviousDemo />
      </Demo>
    </>
  );
}
