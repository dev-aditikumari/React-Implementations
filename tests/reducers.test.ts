import { todoReducer, type Todo } from '../src/state/todoReducer';
import { cartReducer, cartTotal, type CartItem } from '../src/state/cartReducer';

describe('todoReducer', () => {
  const base: Todo[] = [
    { id: 1, text: 'a', done: false },
    { id: 2, text: 'b', done: true },
  ];

  it('adds a trimmed todo with the next id', () => {
    const next = todoReducer(base, { type: 'add', text: '  c  ' });
    expect(next).toHaveLength(3);
    expect(next[2]).toEqual({ id: 3, text: 'c', done: false });
  });

  it('ignores blank text and returns the same state', () => {
    expect(todoReducer(base, { type: 'add', text: '   ' })).toBe(base);
  });

  it('toggles only the matching todo without mutating', () => {
    const next = todoReducer(base, { type: 'toggle', id: 1 });
    expect(next[0].done).toBe(true);
    expect(next[1]).toBe(base[1]);
    expect(base[0].done).toBe(false);
  });

  it('removes a todo and clears completed ones', () => {
    expect(todoReducer(base, { type: 'remove', id: 1 }).map((t) => t.id)).toEqual([2]);
    expect(todoReducer(base, { type: 'clearDone' }).map((t) => t.id)).toEqual([1]);
  });

  it('does not reuse an id after removing the last item', () => {
    const next = todoReducer(todoReducer(base, { type: 'remove', id: 1 }), { type: 'add', text: 'z' });
    expect(next.map((t) => t.id)).toEqual([2, 3]);
  });
});

describe('cartReducer', () => {
  const pen = { id: 'pen', name: 'Pen', price: 1.5 };
  const withPen: CartItem[] = [{ ...pen, qty: 2 }];

  it('adds a new item with quantity 1', () => {
    expect(cartReducer([], { type: 'add', item: pen })).toEqual([{ ...pen, qty: 1 }]);
  });

  it('merges duplicates by increasing quantity', () => {
    expect(cartReducer(withPen, { type: 'add', item: pen })[0].qty).toBe(3);
  });

  it('sets a quantity, flooring decimals', () => {
    expect(cartReducer(withPen, { type: 'setQty', id: 'pen', qty: 5.9 })[0].qty).toBe(5);
  });

  it('removes the item when the quantity is zero, negative or not a number', () => {
    expect(cartReducer(withPen, { type: 'setQty', id: 'pen', qty: 0 })).toEqual([]);
    expect(cartReducer(withPen, { type: 'setQty', id: 'pen', qty: -1 })).toEqual([]);
    expect(cartReducer(withPen, { type: 'setQty', id: 'pen', qty: NaN })).toEqual([]);
  });

  it('removes and clears', () => {
    expect(cartReducer(withPen, { type: 'remove', id: 'pen' })).toEqual([]);
    expect(cartReducer(withPen, { type: 'clear' })).toEqual([]);
  });

  it('totals in cents to avoid floating point drift', () => {
    const items: CartItem[] = [
      { id: 'a', name: 'A', price: 0.1, qty: 3 },
      { id: 'b', name: 'B', price: 0.2, qty: 1 },
    ];
    expect(cartTotal(items)).toBe(0.5);
    expect(cartTotal([])).toBe(0);
  });
});
