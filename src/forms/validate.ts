export interface SignupValues {
  name: string;
  email: string;
  password: string;
}

export type SignupErrors = Partial<Record<keyof SignupValues, string>>;

export function validateSignup(values: SignupValues): SignupErrors {
  const errors: SignupErrors = {};
  if (!values.name.trim()) errors.name = 'Enter your name.';
  if (!values.email.trim()) errors.email = 'Enter your email address.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = 'Enter an email like name@example.com.';
  if (!values.password) errors.password = 'Choose a password.';
  else if (values.password.length < 8) errors.password = 'Use at least 8 characters.';
  else if (!/\d/.test(values.password)) errors.password = 'Include at least one number.';
  return errors;
}
