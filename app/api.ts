const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export function apiUrl(path: string) {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (cleanPath.startsWith('/api/') || cleanPath.startsWith('/uploads/') || cleanPath.startsWith('/duan/') || cleanPath.startsWith('/images/') || cleanPath.startsWith('/original_assets/')) {
    return `${API_BASE_URL}${cleanPath}`;
  }
  return `${API_BASE_URL}/api${cleanPath}`;
}

export function formatAssetUrl(path?: string) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  return apiUrl(path);
}
