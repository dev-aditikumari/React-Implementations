import { validateSignup } from '../src/forms/validate';

describe('validateSignup', () => {
  const ok = { name: 'Aditi', email: 'a@example.com', password: 'secret123' };

  it('accepts valid values', () => {
    expect(validateSignup(ok)).toEqual({});
  });

  it('reports every empty field', () => {
    expect(validateSignup({ name: '', email: '', password: '' })).toEqual({
      name: 'Enter your name.',
      email: 'Enter your email address.',
      password: 'Choose a password.',
    });
  });

  it('rejects a malformed email', () => {
    expect(validateSignup({ ...ok, email: 'nope@' }).email).toMatch(/name@example.com/);
  });

  it('checks password length and digits', () => {
    expect(validateSignup({ ...ok, password: 'short1' }).password).toMatch(/at least 8/);
    expect(validateSignup({ ...ok, password: 'longpassword' }).password).toMatch(/number/);
  });
});
