export interface Note {
  id: number;
  text: string;
}

const SEED: Note[] = [
  { id: 1, text: 'Slices keep reducers and actions together' },
  { id: 2, text: 'Thunks handle async work and dispatch its states' },
  { id: 3, text: 'Typed hooks avoid repeating RootState everywhere' },
];

export interface MockOptions {
  fail?: boolean;
  delayMs?: number;
}

export function fetchNotesFromMock({ fail = false, delayMs = 600 }: MockOptions = {}): Promise<Note[]> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (fail) reject(new Error('The mock server refused the request'));
      else resolve(SEED.map((n) => ({ ...n })));
    }, delayMs);
  });
}
