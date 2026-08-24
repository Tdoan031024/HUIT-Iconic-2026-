import StatusPage from '@/src/components/StatusPage';
import { getStatusPreset } from '@/src/components/status-page-presets';

export default function NotFound() {
  const preset = getStatusPreset(404);

  return (
    <StatusPage
      {...preset}
      actions={[
        { label: 'Về trang chủ', href: '/', variant: 'primary' },
        { label: 'Thử lại', href: '/', variant: 'secondary' },
      ]}
    />
  );
}
