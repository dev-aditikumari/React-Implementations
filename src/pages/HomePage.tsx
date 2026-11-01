import { Link } from 'react-router-dom';
import { pages } from './registry';

export function HomePage() {
  return (
    <>
      <h1>React and TypeScript patterns</h1>
      <p>
        Small, tested examples of common React concepts. Each page has a live demo, a short note on when to use the
        pattern, and the source file to read.
      </p>
      <ul className="cards">
        {pages.map((p) => (
          <li key={p.path}>
            <h2>
              <Link to={p.path}>{p.title}</Link>
            </h2>
            <p>{p.summary}</p>
            <code>{p.file}</code>
          </li>
        ))}
      </ul>
    </>
  );
}
