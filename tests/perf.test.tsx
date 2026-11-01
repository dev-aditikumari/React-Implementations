import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getWindow, VirtualList } from '../src/perf/VirtualList';
import { Benchmark } from '../src/perf/Benchmark';
import { PerformancePage } from '../src/pages/PerformancePage';
import { fireEvent } from '@testing-library/react';

describe('getWindow', () => {
  it('starts at zero with no scroll', () => {
    expect(getWindow(0, 30, 300, 1000, 2)).toEqual({ start: 0, end: 12 });
  });

  it('moves with the scroll position and applies overscan', () => {
    expect(getWindow(3000, 30, 300, 1000, 2)).toEqual({ start: 98, end: 112 });
  });

  it('clamps at the end of the list', () => {
    expect(getWindow(1e9, 30, 300, 100, 2).end).toBe(100);
  });

  it('handles an empty list', () => {
    expect(getWindow(0, 30, 300, 0)).toEqual({ start: 0, end: 0 });
  });
});

describe('VirtualList', () => {
  it('renders only a window of rows and updates on scroll', () => {
    render(<VirtualList total={10000} itemHeight={20} height={100} label="rows" renderItem={(i) => <span>Row {i}</span>} />);
    const list = screen.getByRole('list', { name: 'rows' });
    expect(screen.getAllByRole('listitem').length).toBeLessThan(20);
    expect(screen.getByText('Row 0')).toBeInTheDocument();
    expect(screen.queryByText('Row 5000')).not.toBeInTheDocument();

    fireEvent.scroll(list, { target: { scrollTop: 100000 } });
    expect(screen.getByText('Row 5000')).toBeInTheDocument();
    expect(screen.queryByText('Row 0')).not.toBeInTheDocument();
  });
});

describe('Benchmark', () => {
  it('runs both variants and shows numeric results', async () => {
    const user = userEvent.setup();
    render(<Benchmark rows={40} ticks={3} />);
    await user.click(screen.getByRole('button', { name: 'Run comparison' }));
    const slow = await screen.findByTestId('slow-wall');
    expect(Number(slow.textContent)).toBeGreaterThanOrEqual(0);
    expect(Number(screen.getByTestId('optimised-actual').textContent)).toBeGreaterThanOrEqual(0);
    expect(screen.getByRole('button', { name: 'Run comparison' })).toBeEnabled();
  });
});

describe('PerformancePage', () => {
  it('memo skips re-renders when props are stable, plain and inline handlers do not', async () => {
    const user = userEvent.setup();
    render(<PerformancePage />);
    const rerender = screen.getByRole('button', { name: /Re-render parent/ });
    await user.click(rerender);
    await user.click(rerender);
    expect(screen.getByTestId('renders-plain')).toHaveTextContent('3');
    expect(screen.getByTestId('renders-memo-inline-handler')).toHaveTextContent('3');
    expect(screen.getByTestId('renders-memo-useCallback')).toHaveTextContent('1');
  });

  it('useMemo does not recompute on unrelated updates but does when the input changes', async () => {
    const user = userEvent.setup();
    render(<PerformancePage />);
    expect(screen.getByTestId('primes')).toHaveTextContent('17984');
    expect(screen.getByTestId('calls')).toHaveTextContent('1');
    await user.click(screen.getByRole('button', { name: /Unrelated update/ }));
    expect(screen.getByTestId('calls')).toHaveTextContent('1');
    const input = screen.getByLabelText('Count primes up to');
    fireEvent.change(input, { target: { value: '100' } });
    expect(screen.getByTestId('primes')).toHaveTextContent('25');
  });

  it('shows the Suspense fallback and then the lazy panel', async () => {
    const user = userEvent.setup();
    render(<PerformancePage />);
    await user.click(screen.getByRole('button', { name: 'Load panel' }));
    expect(await screen.findByText(/lives in its own chunk/)).toBeInTheDocument();
  });
});
