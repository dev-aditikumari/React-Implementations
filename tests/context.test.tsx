import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { ContextPage } from '../src/pages/ContextPage';

describe('context misuse', () => {
  let spy: jest.SpyInstance;
  beforeEach(() => {
    spy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });
  afterEach(() => spy.mockRestore());

  it('useTheme throws outside ThemeProvider', () => {
    expect(() => renderHook(() => useTheme())).toThrow('useTheme must be used inside a ThemeProvider');
  });

  it('useAuth throws outside AuthProvider', () => {
    expect(() => renderHook(() => useAuth())).toThrow('useAuth must be used inside an AuthProvider');
  });
});

describe('ThemeProvider', () => {
  it('toggles the theme and sets the data attribute on the document', () => {
    const wrapper = ({ children }: { children: ReactNode }) => <ThemeProvider>{children}</ThemeProvider>;
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.theme).toBe('light');
    act(() => result.current.toggleTheme());
    expect(result.current.theme).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
  });
});

describe('AuthProvider', () => {
  const wrapper = ({ children }: { children: ReactNode }) => <AuthProvider>{children}</AuthProvider>;

  it('logs in with a trimmed name and logs out', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => result.current.login('  Aditi '));
    expect(result.current.user).toEqual({ name: 'Aditi' });
    act(() => result.current.logout());
    expect(result.current.user).toBeNull();
  });

  it('ignores an empty name', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => result.current.login('   '));
    expect(result.current.user).toBeNull();
  });
});

describe('ContextPage', () => {
  it('shares auth state between components and switches theme', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <AuthProvider>
          <ContextPage />
        </AuthProvider>
      </ThemeProvider>,
    );
    expect(screen.getByText(/nobody is signed in/)).toBeInTheDocument();
    await user.type(screen.getByLabelText('Name'), 'Sam');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(screen.getByText(/hello, Sam/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Sign out' }));
    expect(screen.getByText(/nobody is signed in/)).toBeInTheDocument();

    expect(screen.getByTestId('theme-name')).toHaveTextContent('light');
    await user.click(screen.getByRole('button', { name: 'Switch theme' }));
    expect(screen.getByTestId('theme-name')).toHaveTextContent('dark');
  });
});
