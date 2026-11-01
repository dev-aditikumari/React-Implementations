import { useReducer, useState, type FormEvent } from 'react';
import { Demo } from '../components/Demo';
import { todoReducer, type Todo } from '../state/todoReducer';
import { cartReducer, cartTotal, type CartItem } from '../state/cartReducer';

const initialTodos: Todo[] = [
  { id: 1, text: 'Read the useReducer docs', done: true },
  { id: 2, text: 'Write a reducer test', done: false },
];

const catalog: Omit<CartItem, 'qty'>[] = [
  { id: 'pen', name: 'Pen', price: 1.5 },
  { id: 'book', name: 'Book', price: 12.99 },
  { id: 'mug', name: 'Mug', price: 8 },
];

function Counter() {
  const [count, setCount] = useState(0);
  return (
    <p>
      Count: <output aria-label="count">{count}</output>{' '}
      <button type="button" onClick={() => setCount((c) => c + 1)}>
        Increment
      </button>{' '}
      <button type="button" onClick={() => setCount(0)}>
        Reset
      </button>
    </p>
  );
}

function TodoList() {
  const [todos, dispatch] = useReducer(todoReducer, initialTodos);
  const [text, setText] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'add', text });
    setText('');
  };

  return (
    <div>
      <form onSubmit={submit} className="row">
        <label htmlFor="todo-text">New todo</label>
        <input id="todo-text" value={text} onChange={(e) => setText(e.target.value)} />
        <button type="submit">Add</button>
      </form>
      <ul className="plain" aria-label="Todos">
        {todos.map((t) => (
          <li key={t.id}>
            <label>
              <input type="checkbox" checked={t.done} onChange={() => dispatch({ type: 'toggle', id: t.id })} />
              <span className={t.done ? 'done' : ''}>{t.text}</span>
            </label>{' '}
            <button type="button" onClick={() => dispatch({ type: 'remove', id: t.id })} aria-label={`Remove ${t.text}`}>
              Remove
            </button>
          </li>
        ))}
      </ul>
      <p>
        {todos.filter((t) => !t.done).length} remaining{' '}
        <button type="button" onClick={() => dispatch({ type: 'clearDone' })}>
          Clear completed
        </button>
      </p>
    </div>
  );
}

function Cart() {
  const [items, dispatch] = useReducer(cartReducer, []);
  return (
    <div>
      <ul className="plain" aria-label="Catalog">
        {catalog.map((p) => (
          <li key={p.id}>
            {p.name} (${p.price.toFixed(2)}){' '}
            <button type="button" onClick={() => dispatch({ type: 'add', item: p })}>
              Add {p.name}
            </button>
          </li>
        ))}
      </ul>
      <h3>Cart</h3>
      {items.length === 0 ? (
        <p>The cart is empty.</p>
      ) : (
        <ul className="plain" aria-label="Cart">
          {items.map((i) => (
            <li key={i.id}>
              {i.name}{' '}
              <input
                type="number"
                min={0}
                value={i.qty}
                aria-label={`Quantity of ${i.name}`}
                onChange={(e) => dispatch({ type: 'setQty', id: i.id, qty: Number(e.target.value) })}
                className="qty"
              />{' '}
              <button type="button" onClick={() => dispatch({ type: 'remove', id: i.id })}>
                Remove {i.name}
              </button>
            </li>
          ))}
        </ul>
      )}
      <p>
        Total: <strong data-testid="cart-total">${cartTotal(items).toFixed(2)}</strong>{' '}
        <button type="button" onClick={() => dispatch({ type: 'clear' })} disabled={items.length === 0}>
          Clear cart
        </button>
      </p>
    </div>
  );
}

export function StatePage() {
  return (
    <>
      <h1>State</h1>
      <Demo title="useState" when="One or two independent values, such as a toggle, an input or a counter.">
        <Counter />
      </Demo>
      <Demo
        title="useReducer: todo list"
        when="Several update types act on the same value. The reducer is a pure function, so it is easy to test without rendering."
      >
        <TodoList />
      </Demo>
      <Demo title="useReducer: shopping cart" when="The next state depends on the previous one and has rules, such as merging duplicates and removing at zero.">
        <Cart />
      </Demo>
    </>
  );
}
