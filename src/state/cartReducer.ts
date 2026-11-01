export interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

export type CartAction =
  | { type: 'add'; item: Omit<CartItem, 'qty'> }
  | { type: 'setQty'; id: string; qty: number }
  | { type: 'remove'; id: string }
  | { type: 'clear' };

export function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case 'add': {
      const existing = state.find((i) => i.id === action.item.id);
      if (existing) {
        return state.map((i) => (i.id === existing.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...state, { ...action.item, qty: 1 }];
    }
    case 'setQty': {
      const qty = Math.floor(action.qty);
      if (!Number.isFinite(qty) || qty <= 0) return state.filter((i) => i.id !== action.id);
      return state.map((i) => (i.id === action.id ? { ...i, qty } : i));
    }
    case 'remove':
      return state.filter((i) => i.id !== action.id);
    case 'clear':
      return [];
  }
}

export function cartTotal(items: CartItem[]): number {
  const cents = items.reduce((sum, i) => sum + Math.round(i.price * 100) * i.qty, 0);
  return cents / 100;
}
