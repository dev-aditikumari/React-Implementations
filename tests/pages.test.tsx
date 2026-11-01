import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { StatePage } from '../src/pages/StatePage';
import { HooksPage } from '../src/pages/HooksPage';
import { FormsPage } from '../src/pages/FormsPage';
import { ErrorsA11yPage } from '../src/pages/ErrorsA11yPage';
import { HomePage } from '../src/pages/HomePage';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { App } from '../src/App';
import { ThemeProvider } from '../src/context/ThemeContext';
import { AuthProvider } from '../src/context/AuthContext';
import { pages } from '../src/pages/registry';

const future = { v7_startTransition: true, v7_relativeSplatPath: true };

describe('StatePage', () => {
  it('counter increments and resets', async () => {
    const user = userEvent.setup();
    render(<StatePage />);
    await user.click(screen.getByRole('button', { name: 'Increment' }));
    await user.click(screen.getByRole('button', { name: 'Increment' }));
    expect(screen.getByLabelText('count')).toHaveTextContent('2');
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByLabelText('count')).toHaveTextContent('0');
  });

  it('adds, completes and clears todos', async () => {
    const user = userEvent.setup();
    render(<StatePage />);
    const list = screen.getByRole('list', { name: 'Todos' });
    expect(list.querySelectorAll('li')).toHaveLength(2);
    await user.type(screen.getByLabelText('New todo'), 'Ship it');
    await user.click(screen.getByRole('button', { name: 'Add' }));
    expect(screen.getByText('Ship it')).toBeInTheDocument();
    expect(screen.getByText(/2 remaining/)).toBeInTheDocument();
    await user.click(screen.getByRole('checkbox', { name: 'Ship it' }));
    expect(screen.getByText(/1 remaining/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Clear completed' }));
    expect(screen.queryByText('Ship it')).not.toBeInTheDocument();
    expect(screen.queryByText('Read the useReducer docs')).not.toBeInTheDocument();
  });

  it('cart merges duplicates, updates the total and removes at zero', async () => {
    const user = userEvent.setup();
    render(<StatePage />);
    expect(screen.getByText('The cart is empty.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Add Book' }));
    await user.click(screen.getByRole('button', { name: 'Add Book' }));
    await user.click(screen.getByRole('button', { name: 'Add Pen' }));
    expect(screen.getByLabelText('Quantity of Book')).toHaveValue(2);
    expect(screen.getByTestId('cart-total')).toHaveTextContent('$27.48');
    const qty = screen.getByLabelText('Quantity of Pen');
    await user.clear(qty);
    expect(screen.queryByLabelText('Quantity of Pen')).not.toBeInTheDocument();
    expect(screen.getByTestId('cart-total')).toHaveTextContent('$25.98');
    await user.click(screen.getByRole('button', { name: 'Clear cart' }));
    expect(screen.getByText('The cart is empty.')).toBeInTheDocument();
  });
});

describe('HooksPage', () => {
  const realFetch = global.fetch;
  afterEach(() => {
    global.fetch = realFetch;
    window.localStorage.clear();
    jest.useRealTimers();
  });

  it('useFetch demo shows data, then an error for a missing file', async () => {
    const user = userEvent.setup();
    global.fetch = jest.fn((url: RequestInfo | URL) =>
      Promise.resolve(
        String(url).includes('missing')
          ? { ok: false, status: 404, json: () => Promise.resolve(null) }
          : { ok: true, json: () => Promise.resolve([{ id: 1, name: 'Notebook', price: 4.5 }]) },
      ),
    ) as unknown as typeof fetch;
    render(<HooksPage />);
    expect(await screen.findByText('Notebook: $4.50')).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('File'), 'missing');
    expect(await screen.findByRole('alert')).toHaveTextContent('status 404');
  });

  it('debounce demo updates the debounced value after the delay', async () => {
    jest.useFakeTimers();
    global.fetch = jest.fn(() => new Promise(() => undefined)) as unknown as typeof fetch;
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<HooksPage />);
    await user.type(screen.getByLabelText('Search'), 'abc');
    expect(screen.getByTestId('debounced')).toHaveTextContent('');
    act(() => {
      jest.advanceTimersByTime(400);
    });
    expect(screen.getByTestId('debounced')).toHaveTextContent('abc');
  });

  it('localStorage demo persists the note', async () => {
    const user = userEvent.setup();
    global.fetch = jest.fn(() => new Promise(() => undefined)) as unknown as typeof fetch;
    render(<HooksPage />);
    await user.type(screen.getByLabelText(/Note/), 'hi');
    expect(window.localStorage.getItem('react-implementations:note')).toBe('"hi"');
  });

  it('click outside closes the menu and usePrevious shows the old value', async () => {
    const user = userEvent.setup();
    global.fetch = jest.fn(() => new Promise(() => undefined)) as unknown as typeof fetch;
    render(<HooksPage />);
    const menu = screen.getByRole('button', { name: 'Menu' });
    await user.click(menu);
    expect(screen.getByText('Profile')).toBeInTheDocument();
    await user.click(screen.getByText('Profile'));
    expect(screen.getByText('Profile')).toBeInTheDocument();
    await user.click(document.body);
    expect(screen.queryByText('Profile')).not.toBeInTheDocument();

    expect(screen.getByTestId('previous')).toHaveTextContent('none');
    await user.click(screen.getByRole('button', { name: 'Add one' }));
    await user.click(screen.getByRole('button', { name: 'Add one' }));
    expect(screen.getByTestId('previous')).toHaveTextContent('1');
  });
});

describe('FormsPage', () => {
  it('controlled form shows accessible errors, focuses the first invalid field and clears them on fix', async () => {
    const user = userEvent.setup();
    render(<FormsPage />);
    const form = screen.getAllByRole('button', { name: 'Create account' })[0].closest('form')!;
    await user.click(screen.getAllByRole('button', { name: 'Create account' })[0]);
    const name = form.querySelector<HTMLInputElement>('#c-name')!;
    expect(name).toHaveAttribute('aria-invalid', 'true');
    expect(name).toHaveAccessibleDescription('Enter your name.');
    expect(name).toHaveFocus();
    await user.type(name, 'Aditi');
    expect(name).not.toHaveAttribute('aria-invalid');
    await user.type(form.querySelector('#c-email')!, 'a@example.com');
    await user.type(form.querySelector('#c-password')!, 'secret123');
    await user.click(screen.getAllByRole('button', { name: 'Create account' })[0]);
    expect(screen.getByText('Controlled form is valid and submitted.')).toBeInTheDocument();
  });

  it('uncontrolled form reads values on submit and resets', async () => {
    const user = userEvent.setup();
    render(<FormsPage />);
    const submit = screen.getAllByRole('button', { name: 'Create account' })[1];
    await user.click(submit);
    expect(document.getElementById('u-email')).toHaveAccessibleDescription('Enter your email address.');
    await user.type(document.getElementById('u-name')!, 'Sam');
    await user.type(document.getElementById('u-email')!, 'bad');
    await user.type(document.getElementById('u-password')!, 'abc');
    await user.click(submit);
    expect(document.getElementById('u-email')).toHaveAccessibleDescription('Enter an email like name@example.com.');
    await user.clear(document.getElementById('u-email')!);
    await user.type(document.getElementById('u-email')!, 'sam@example.com');
    await user.clear(document.getElementById('u-password')!);
    await user.type(document.getElementById('u-password')!, 'abcdefg1');
    await user.click(submit);
    expect(screen.getByText('Uncontrolled form is valid and submitted.')).toBeInTheDocument();
    expect(document.getElementById('u-name')).toHaveValue('');
  });
});

describe('ErrorsA11yPage', () => {
  afterEach(() => jest.useRealTimers());

  it('error boundary catches a crash and recovers', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const user = userEvent.setup();
    render(<ErrorsA11yPage />);
    await user.click(screen.getByRole('button', { name: 'Crash the component' }));
    expect(screen.getByRole('alert')).toHaveTextContent('crashed on purpose');
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(screen.getByText('This component is healthy.')).toBeInTheDocument();
    spy.mockRestore();
  });

  it('suspense shows a fallback then the content', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<ErrorsA11yPage />);
    await user.click(screen.getByRole('button', { name: 'Load slow panel' }));
    expect(screen.getByText('Loading the slow panel...')).toBeInTheDocument();
    await act(async () => {
      jest.advanceTimersByTime(1300);
    });
    expect(screen.getByText('The slow panel has loaded.')).toBeInTheDocument();
    jest.useRealTimers();
  });

  it('dialog moves focus in, traps Tab, closes on Escape and restores focus', async () => {
    const user = userEvent.setup();
    render(<ErrorsA11yPage />);
    const opener = screen.getByRole('button', { name: 'Open dialog' });
    await user.click(opener);
    const dialog = screen.getByRole('dialog', { name: 'Confirm' });
    const close = screen.getByRole('button', { name: 'Close' });
    expect(close).toHaveFocus();
    await user.tab();
    expect(screen.getByLabelText('Optional comment')).toHaveFocus();
    await user.tab();
    expect(close).toHaveFocus();
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });

  it('live region announces basket changes', async () => {
    const user = userEvent.setup();
    render(<ErrorsA11yPage />);
    await user.click(screen.getByRole('button', { name: 'Add to basket' }));
    expect(screen.getByTestId('live')).toHaveTextContent('1 item in the basket');
    await user.click(screen.getByRole('button', { name: 'Add to basket' }));
    expect(screen.getByTestId('live')).toHaveTextContent('2 items in the basket');
  });
});

describe('ErrorBoundary', () => {
  it('renders children when nothing throws', () => {
    render(
      <ErrorBoundary>
        <p>fine</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText('fine')).toBeInTheDocument();
  });
});

describe('Home and routing', () => {
  const realFetch = global.fetch;
  beforeEach(() => {
    global.fetch = jest.fn(() => new Promise(() => undefined)) as unknown as typeof fetch;
  });
  afterEach(() => {
    global.fetch = realFetch;
  });

  const renderApp = (path: string) =>
    render(
      <MemoryRouter initialEntries={[path]} future={future}>
        <ThemeProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ThemeProvider>
      </MemoryRouter>,
    );

  it('home lists every demo with a link', () => {
    render(
      <MemoryRouter future={future}>
        <HomePage />
      </MemoryRouter>,
    );
    for (const p of pages) {
      expect(screen.getByRole('link', { name: p.title })).toHaveAttribute('href', p.path);
    }
  });

  it.each(pages.map((p) => [p.path, p.title]))('route %s renders its heading', async (path) => {
    renderApp(path);
    expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Demos' })).toBeInTheDocument();
  });

  it('shows a not found page for unknown routes', async () => {
    renderApp('/nope');
    expect(await screen.findByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
  });

  it('header toggle switches the theme', async () => {
    const user = userEvent.setup();
    renderApp('/');
    await user.click(screen.getByRole('button', { name: /Dark theme: off/ }));
    expect(screen.getByRole('button', { name: /Dark theme: on/ })).toHaveAttribute('aria-pressed', 'true');
  });
});
