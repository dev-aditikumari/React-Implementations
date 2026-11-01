import { NavLink, Outlet } from 'react-router-dom';
import { pages } from '../pages/registry';
import { useTheme } from '../context/ThemeContext';

export function Layout() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="topbar">
        <NavLink to="/" className="brand" end>
          React Implementations
        </NavLink>
        <button type="button" onClick={toggleTheme} aria-pressed={theme === 'dark'}>
          Dark theme: {theme === 'dark' ? 'on' : 'off'}
        </button>
      </header>
      <nav className="sidebar" aria-label="Demos">
        <ul>
          {pages.map((p) => (
            <li key={p.path}>
              <NavLink to={p.path}>{p.title}</NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  );
}
