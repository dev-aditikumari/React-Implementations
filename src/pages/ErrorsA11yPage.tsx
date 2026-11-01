import { Suspense, lazy, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Demo } from '../components/Demo';
import { ErrorBoundary } from '../components/ErrorBoundary';

function Bomb({ explode }: { explode: boolean }) {
  if (explode) throw new Error('The demo component crashed on purpose');
  return <p>This component is healthy.</p>;
}

function BoundaryDemo() {
  const [explode, setExplode] = useState(false);
  return (
    <div>
      <button type="button" onClick={() => setExplode(true)}>
        Crash the component
      </button>
      <ErrorBoundary label="demo" onReset={() => setExplode(false)}>
        <Bomb explode={explode} />
      </ErrorBoundary>
    </div>
  );
}

const SlowPanel = lazy(
  () =>
    new Promise<{ default: () => JSX.Element }>((resolve) => {
      setTimeout(() => resolve({ default: () => <p>The slow panel has loaded.</p> }), 1200);
    }),
);

function SuspenseDemo() {
  const [show, setShow] = useState(false);
  return (
    <div>
      <button type="button" onClick={() => setShow(true)} disabled={show}>
        Load slow panel
      </button>
      {show && (
        <Suspense fallback={<p role="status">Loading the slow panel...</p>}>
          <SlowPanel />
        </Suspense>
      )}
    </div>
  );
}

function DialogDemo() {
  const [open, setOpen] = useState(false);
  const opener = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) closeBtn.current?.focus();
  }, [open]);

  const close = () => {
    setOpen(false);
    opener.current?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      close();
      return;
    }
    if (e.key !== 'Tab') return;
    const focusable = dialog.current?.querySelectorAll<HTMLElement>('button, input, a[href]');
    if (!focusable || focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <div>
      <button type="button" ref={opener} onClick={() => setOpen(true)} aria-haspopup="dialog">
        Open dialog
      </button>
      {open && (
        <div className="backdrop">
          <div role="dialog" aria-modal="true" aria-labelledby="dlg-title" ref={dialog} onKeyDown={onKeyDown} className="dialog">
            <h3 id="dlg-title">Confirm</h3>
            <p>Focus moved here when the dialog opened. Tab stays inside it, Escape closes it, and focus returns to the opener.</p>
            <label htmlFor="dlg-input">Optional comment</label> <input id="dlg-input" />
            <p>
              <button type="button" ref={closeBtn} onClick={close}>
                Close
              </button>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function LiveDemo() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <button type="button" onClick={() => setCount((c) => c + 1)}>
        Add to basket
      </button>
      <p role="status" aria-live="polite" data-testid="live">
        {count === 0 ? '' : `${count} item${count === 1 ? '' : 's'} in the basket`}
      </p>
    </div>
  );
}

export function ErrorsA11yPage() {
  return (
    <>
      <h1>Error boundaries and accessibility</h1>
      <Demo title="Error boundary" when="Contain a rendering crash to one part of the page and offer a way to recover. Boundaries do not catch errors in event handlers or async code.">
        <BoundaryDemo />
      </Demo>
      <Demo title="Suspense fallback" when="A lazy component or data source is not ready yet. The fallback is announced with role=status.">
        <SuspenseDemo />
      </Demo>
      <Demo title="Focus management in a dialog" when="Any modal UI: move focus in, keep it in, restore it on close, and let Escape close it.">
        <DialogDemo />
      </Demo>
      <Demo title="Live region" when="A change happens away from the focused element and screen reader users should hear about it.">
        <LiveDemo />
      </Demo>
    </>
  );
}
