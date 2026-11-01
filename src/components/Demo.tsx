import type { ReactNode } from 'react';

interface DemoProps {
  title: string;
  when: string;
  children: ReactNode;
}

export function Demo({ title, when, children }: DemoProps) {
  return (
    <section className="demo" aria-labelledby={`h-${title.replace(/\W+/g, '-').toLowerCase()}`}>
      <h2 id={`h-${title.replace(/\W+/g, '-').toLowerCase()}`}>{title}</h2>
      <p className="when">
        <strong>When to use it:</strong> {when}
      </p>
      <div className="demo-body">{children}</div>
    </section>
  );
}
