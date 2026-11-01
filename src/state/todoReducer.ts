export interface Todo {
  id: number;
  text: string;
  done: boolean;
}

export type TodoAction =
  | { type: 'add'; text: string }
  | { type: 'toggle'; id: number }
  | { type: 'remove'; id: number }
  | { type: 'clearDone' };

export function todoReducer(state: Todo[], action: TodoAction): Todo[] {
  switch (action.type) {
    case 'add': {
      const text = action.text.trim();
      if (!text) return state;
      const id = state.reduce((max, t) => Math.max(max, t.id), 0) + 1;
      return [...state, { id, text, done: false }];
    }
    case 'toggle':
      return state.map((t) => (t.id === action.id ? { ...t, done: !t.done } : t));
    case 'remove':
      return state.filter((t) => t.id !== action.id);
    case 'clearDone':
      return state.filter((t) => !t.done);
  }
}
