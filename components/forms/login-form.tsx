'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { loginAction, type LoginActionState } from '@/lib/services/auth-service';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 h-10 w-full rounded-md bg-brand text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-70"
    >
      {pending ? 'Se autentifica...' : 'Login'}
    </button>
  );
}

const INITIAL_STATE: LoginActionState = {};

export function LoginForm() {
  const [state, formAction] = useFormState(loginAction, INITIAL_STATE);

  return (
    <form action={formAction} className="space-y-3">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" placeholder="admin@digitaldot.ro" required />
      </div>

      <div>
        <Label htmlFor="password">Parola</Label>
        <Input id="password" name="password" type="password" placeholder="••••••••" required />
      </div>

      {state.error ? <p className="text-sm text-danger">{state.error}</p> : null}

      <SubmitButton />
    </form>
  );
}
