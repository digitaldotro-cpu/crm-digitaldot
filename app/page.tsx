import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/current-user';

export default async function HomePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (user.role === 'CLIENT') {
    redirect('/portal');
  }

  redirect('/dashboard');
}
