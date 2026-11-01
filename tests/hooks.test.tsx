import { act, renderHook, waitFor } from '@testing-library/react';
import { useRef } from 'react';
import { useDebounce } from '../src/hooks/useDebounce';
import { usePrevious } from '../src/hooks/usePrevious';
import { useLocalStorage } from '../src/hooks/useLocalStorage';
import { useOnClickOutside } from '../src/hooks/useOnClickOutside';
import { useFetch } from '../src/hooks/useFetch';

describe('useDebounce', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('a', 300));
    expect(result.current).toBe('a');
  });

  it('only updates after the delay and restarts on each change', () => {
    const { result, rerender } = renderHook(({ v }) => useDebounce(v, 300), { initialProps: { v: 'a' } });
    rerender({ v: 'b' });
    act(() => {
      jest.advanceTimersByTime(200);
    });
    rerender({ v: 'c' });
    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(result.current).toBe('a');
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(result.current).toBe('c');
  });
});

describe('usePrevious', () => {
  it('is undefined first, then the value from the previous render', () => {
    const { result, rerender } = renderHook(({ v }) => usePrevious(v), { initialProps: { v: 1 } });
    expect(result.current).toBeUndefined();
    rerender({ v: 2 });
    expect(result.current).toBe(1);
    rerender({ v: 3 });
    expect(result.current).toBe(2);
  });
});

describe('useLocalStorage', () => {
  beforeEach(() => window.localStorage.clear());

  it('reads an existing value and writes updates', () => {
    window.localStorage.setItem('k', JSON.stringify('saved'));
    const { result } = renderHook(() => useLocalStorage('k', 'initial'));
    expect(result.current[0]).toBe('saved');
    act(() => result.current[1]('next'));
    expect(result.current[0]).toBe('next');
    expect(window.localStorage.getItem('k')).toBe('"next"');
  });

  it('supports functional updates', () => {
    const { result } = renderHook(() => useLocalStorage('n', 1));
    act(() => result.current[1]((n) => n + 1));
    expect(result.current[0]).toBe(2);
  });

  it('falls back to the initial value when stored JSON is invalid', () => {
    window.localStorage.setItem('bad', '{oops');
    const { result } = renderHook(() => useLocalStorage('bad', 'fallback'));
    expect(result.current[0]).toBe('fallback');
  });

  it('keeps working in memory when storage throws', () => {
    const spy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    const { result } = renderHook(() => useLocalStorage('q', 'a'));
    act(() => result.current[1]('b'));
    expect(result.current[0]).toBe('b');
    spy.mockRestore();
  });
});

describe('useOnClickOutside', () => {
  it('calls the handler for outside clicks only and cleans up on unmount', () => {
    const inside = document.createElement('div');
    const outside = document.createElement('div');
    document.body.append(inside, outside);
    const handler = jest.fn();

    const { unmount } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(inside);
      useOnClickOutside(ref, handler);
    });

    inside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    expect(handler).not.toHaveBeenCalled();
    outside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    expect(handler).toHaveBeenCalledTimes(1);

    unmount();
    outside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    expect(handler).toHaveBeenCalledTimes(1);
    inside.remove();
    outside.remove();
  });
});

describe('useFetch', () => {
  const realFetch = global.fetch;
  afterEach(() => {
    global.fetch = realFetch;
  });

  it('loads data', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve([1, 2]) });
    const { result } = renderHook(() => useFetch<number[]>('/x'));
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual([1, 2]);
    expect(result.current.error).toBeNull();
  });

  it('reports HTTP errors', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 404, json: () => Promise.resolve(null) });
    const { result } = renderHook(() => useFetch('/missing'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Request failed with status 404');
  });

  it('reports network failures', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('offline'));
    const { result } = renderHook(() => useFetch('/x'));
    await waitFor(() => expect(result.current.error).toBe('offline'));
  });

  it('does not fetch when the url is null', () => {
    global.fetch = jest.fn();
    const { result } = renderHook(() => useFetch(null));
    expect(global.fetch).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
  });

  it('aborts the previous request when the url changes and on unmount', async () => {
    const signals: AbortSignal[] = [];
    global.fetch = jest.fn((_url: RequestInfo | URL, init?: RequestInit) => {
      signals.push(init!.signal as AbortSignal);
      return new Promise((_resolve, reject) => {
        init!.signal!.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')));
      });
    }) as unknown as typeof fetch;

    const { result, rerender, unmount } = renderHook(({ url }) => useFetch(url), { initialProps: { url: '/a' } });
    rerender({ url: '/b' });
    expect(signals[0].aborted).toBe(true);
    expect(signals[1].aborted).toBe(false);
    unmount();
    expect(signals[1].aborted).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('ignores a response that arrives after abort and refetch triggers a new request', async () => {
    const fetchMock = jest.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve('v') });
    global.fetch = fetchMock;
    const { result } = renderHook(() => useFetch<string>('/x'));
    await waitFor(() => expect(result.current.data).toBe('v'));
    act(() => result.current.refetch());
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  });
});
