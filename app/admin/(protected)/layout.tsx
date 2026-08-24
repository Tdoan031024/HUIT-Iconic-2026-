import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const token = cookies().get('admin_session')?.value;
  // If token is set or in dev, allow access
  const isAuthenticated = !!token || process.env.NODE_ENV === 'development';

  if (!isAuthenticated) {
    redirect('/401?redirect=/admin');
  }

  return <>{children}</>;
}
