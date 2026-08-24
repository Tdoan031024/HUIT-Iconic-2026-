'use client';

import { useEffect } from 'react';
import StatusPage from '@/src/components/StatusPage';
import { getStatusPreset } from '@/src/components/status-page-presets';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const preset = getStatusPreset(500);

  return (
    <StatusPage
      {...preset}
      actions={[
        { label: 'Thử lại', onClick: reset, variant: 'primary' },
        { label: 'Về trang chủ', href: '/', variant: 'secondary' },
      ]}
    />
  );
}
