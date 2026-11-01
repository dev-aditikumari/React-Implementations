import { useState, type ReactNode, type UIEvent } from 'react';

export interface WindowRange {
  start: number;
  end: number;
}

export function getWindow(scrollTop: number, itemHeight: number, viewportHeight: number, total: number, overscan = 3): WindowRange {
  const first = Math.floor(scrollTop / itemHeight);
  const visible = Math.ceil(viewportHeight / itemHeight);
  const start = Math.max(0, first - overscan);
  const end = Math.min(total, first + visible + overscan);
  return { start, end };
}

interface VirtualListProps {
  total: number;
  itemHeight: number;
  height: number;
  renderItem: (index: number) => ReactNode;
  label: string;
}

export function VirtualList({ total, itemHeight, height, renderItem, label }: VirtualListProps) {
  const [scrollTop, setScrollTop] = useState(0);
  const { start, end } = getWindow(scrollTop, itemHeight, height, total);

  const rows: ReactNode[] = [];
  for (let i = start; i < end; i++) {
    rows.push(
      <div
        key={i}
        role="listitem"
        style={{ position: 'absolute', top: i * itemHeight, height: itemHeight, left: 0, right: 0 }}
        className="vrow"
      >
        {renderItem(i)}
      </div>,
    );
  }

  return (
    <div
      role="list"
      aria-label={label}
      aria-rowcount={total}
      tabIndex={0}
      className="viewport"
      style={{ height, overflowY: 'auto', position: 'relative' }}
      onScroll={(e: UIEvent<HTMLDivElement>) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: total * itemHeight, position: 'relative' }}>{rows}</div>
    </div>
  );
}
