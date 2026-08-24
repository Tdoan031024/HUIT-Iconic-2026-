import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAdminSession } from '@/lib/auth';

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const token = cookies().get('admin_session')?.value;
  const admin = await verifyAdminSession(null, token);
  const isAuthenticated = Boolean(admin);

  if (!isAuthenticated) {
    redirect('/401?redirect=/admin');
  }

  return <>{children}</>;
}
