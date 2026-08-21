import React from 'react';
import './globals.css';
import ClientShell from './ClientShell';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientShell>{children}</ClientShell>;
}
