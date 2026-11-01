import { useState, type FormEvent } from 'react';
import { Demo } from '../components/Demo';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

function ThemeDemo() {
  const { theme, toggleTheme } = useTheme();
  return (
    <p>
      Current theme: <strong data-testid="theme-name">{theme}</strong>{' '}
      <button type="button" onClick={toggleTheme}>
        Switch theme
      </button>
    </p>
  );
}

function AuthDemo() {
  const { user, login, logout } = useAuth();
  const [name, setName] = useState('');

  if (user) {
    return (
      <p>
        Signed in as <strong>{user.name}</strong>{' '}
        <button type="button" onClick={logout}>
          Sign out
        </button>
      </p>
    );
  }

  const submit = (e: FormEvent) => {
    e.preventDefault();
    login(name);
  };

  return (
    <form onSubmit={submit} className="row">
      <label htmlFor="auth-name">Name</label>
      <input id="auth-name" value={name} onChange={(e) => setName(e.target.value)} />
      <button type="submit">Sign in</button>
    </form>
  );
}

function AuthStatus() {
  const { user } = useAuth();
  return <p>A separate component reads the same context: {user ? `hello, ${user.name}` : 'nobody is signed in'}.</p>;
}

export function ContextPage() {
  return (
    <>
      <h1>Context API</h1>
      <Demo
        title="Theme context"
        when="A value many distant components need, such as theme or locale, that changes rarely. The header toggle uses the same context."
      >
        <ThemeDemo />
      </Demo>
      <Demo title="Auth-style context" when="Shared session data. Keep the provider value memoized so consumers do not re-render needlessly.">
        <AuthDemo />
        <AuthStatus />
      </Demo>
      <Demo title="Safe custom hooks" when="Always. useTheme and useAuth throw a clear error when used outside their provider, instead of failing later on undefined.">
        <p>
          See <code>src/context/ThemeContext.tsx</code> and <code>tests/context.test.tsx</code>.
        </p>
      </Demo>
    </>
  );
}
