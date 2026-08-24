'use client';

import StatusPage from '@/src/components/StatusPage';
import { getStatusPreset } from '@/src/components/status-page-presets';

export default function Status404Page() {
  const preset = getStatusPreset(404);

  return (
    <StatusPage
      {...preset}
      actions={[
        { label: 'Về trang chủ', href: '/', variant: 'primary' },
        { label: 'Thử lại', onClick: () => window.location.reload(), variant: 'secondary' },
      ]}
    />
  );
}
