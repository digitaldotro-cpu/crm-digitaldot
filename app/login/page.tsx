import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { getCurrentUser } from '@/lib/auth/current-user';
import { LoginForm } from '@/components/forms/login-form';

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user?.role === 'CLIENT') {
    redirect('/portal');
  }
  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <Card className="w-full max-w-md p-6">
        <p className="text-xs uppercase tracking-wide text-muted">CRM Digital Dot</p>
        <h1 className="mt-1 text-2xl font-bold text-foreground">Sign in</h1>
        <p className="mt-1 text-sm text-muted">Acces intern si portal client</p>

        <div className="mt-5">
          <LoginForm />
        </div>

        <div className="mt-5 rounded-md bg-slate-50 p-3 text-xs text-muted">
          Demo seed users: admin@digitaldot.ro, pm@digitaldot.ro, specialist@digitaldot.ro, finance@digitaldot.ro,
          client@fitcore.ro (parola in README)
        </div>
      </Card>
    </div>
  );
}
