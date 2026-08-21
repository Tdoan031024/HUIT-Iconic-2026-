export function apiUrl(path: string) {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (cleanPath.startsWith('/api/')) {
    return cleanPath;
  }
  if (cleanPath.startsWith('admin/') || cleanPath.startsWith('/admin/')) {
    const sub = cleanPath.replace(/^\/?admin/, '');
    return `/api/admin${sub.startsWith('/') ? sub : `/${sub}`}`;
  }
  return `/api/admin${cleanPath}`;
}

export function formatAssetUrl(url: string | undefined | null): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  if (cleanPath.startsWith('/admin/')) {
    return cleanPath.replace(/^\/admin/, '');
  }
  return cleanPath;
}
