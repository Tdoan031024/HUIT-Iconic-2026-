'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import ClientLayout from './ClientLayout';
import { initDevToolsProtection } from '@/src/utils/devtoolsProtection';

type ClientShellProps = {
  children: React.ReactNode;
};

export default function ClientShell({ children }: ClientShellProps) {
  const pathname = usePathname();
  const isLoginRoute = pathname === '/admin/login' || pathname?.startsWith('/admin/login/');

  useEffect(() => {
    const cleanup = initDevToolsProtection();
    return cleanup;
  }, []);

  if (isLoginRoute) {
    return <>{children}</>;
  }

  return <ClientLayout>{children}</ClientLayout>;
}
