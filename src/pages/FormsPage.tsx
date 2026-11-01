import { useRef, useState, type FormEvent } from 'react';
import { Demo } from '../components/Demo';
import { validateSignup, type SignupErrors, type SignupValues } from '../forms/validate';

const empty: SignupValues = { name: '', email: '', password: '' };

interface FieldProps {
  id: keyof SignupValues;
  label: string;
  type?: string;
  value?: string;
  onChange?: (v: string) => void;
  error?: string;
  inputRef?: React.Ref<HTMLInputElement>;
  prefix: string;
}

function Field({ id, label, type = 'text', value, onChange, error, inputRef, prefix }: FieldProps) {
  const inputId = `${prefix}-${id}`;
  const errorId = `${inputId}-error`;
  const controlled = onChange !== undefined;
  return (
    <div className="field">
      <label htmlFor={inputId}>{label}</label>
      <input
        id={inputId}
        name={id}
        type={type}
        ref={inputRef}
        {...(controlled ? { value, onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value) } : {})}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        autoComplete={id === 'password' ? 'new-password' : id}
      />
      {error && (
        <p id={errorId} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}

function ControlledForm() {
  const [values, setValues] = useState<SignupValues>(empty);
  const [errors, setErrors] = useState<SignupErrors>({});
  const [done, setDone] = useState(false);

  const set = (key: keyof SignupValues) => (v: string) => {
    const next = { ...values, [key]: v };
    setValues(next);
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: validateSignup(next)[key] }));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const found = validateSignup(values);
    setErrors(found);
    setDone(Object.keys(found).length === 0);
    if (Object.keys(found).length > 0) {
      const first = (Object.keys(found) as (keyof SignupValues)[])[0];
      document.getElementById(`c-${first}`)?.focus();
    }
  };

  return (
    <form onSubmit={submit} noValidate>
      <Field prefix="c" id="name" label="Name" value={values.name} onChange={set('name')} error={errors.name} />
      <Field prefix="c" id="email" label="Email" type="email" value={values.email} onChange={set('email')} error={errors.email} />
      <Field prefix="c" id="password" label="Password" type="password" value={values.password} onChange={set('password')} error={errors.password} />
      <button type="submit">Create account</button>
      <p role="status">{done ? 'Controlled form is valid and submitted.' : ''}</p>
      <p className="hint">
        Live preview of state: <code>{values.name || '(empty)'}</code>
      </p>
    </form>
  );
}

function UncontrolledForm() {
  const [errors, setErrors] = useState<SignupErrors>({});
  const [done, setDone] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const values: SignupValues = {
      name: String(data.get('name') ?? ''),
      email: String(data.get('email') ?? ''),
      password: String(data.get('password') ?? ''),
    };
    const found = validateSignup(values);
    setErrors(found);
    setDone(Object.keys(found).length === 0);
    if (Object.keys(found).length === 0) formRef.current?.reset();
  };

  return (
    <form onSubmit={submit} ref={formRef} noValidate>
      <Field prefix="u" id="name" label="Name" error={errors.name} />
      <Field prefix="u" id="email" label="Email" type="email" error={errors.email} />
      <Field prefix="u" id="password" label="Password" type="password" error={errors.password} />
      <button type="submit">Create account</button>
      <p role="status">{done ? 'Uncontrolled form is valid and submitted.' : ''}</p>
    </form>
  );
}

export function FormsPage() {
  return (
    <>
      <h1>Forms</h1>
      <Demo
        title="Controlled form"
        when="You need the value on every keystroke: live validation, formatting, or fields that depend on each other. React state is the source of truth."
      >
        <ControlledForm />
      </Demo>
      <Demo title="Uncontrolled form" when="You only need the values on submit. The DOM keeps the value and FormData reads it, which means fewer renders and less code.">
        <UncontrolledForm />
      </Demo>
      <Demo title="Accessible errors" when="Always. Each input has a label, invalid inputs get aria-invalid and aria-describedby pointing at the message, and focus moves to the first invalid field.">
        <p>Submit either form empty to see the messages. Both use the same validation function in <code>src/forms/validate.ts</code>.</p>
      </Demo>
    </>
  );
}
