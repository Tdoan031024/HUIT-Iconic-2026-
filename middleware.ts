import { NextRequest, NextResponse } from 'next/server';
const publicAdminApi = new Set(['/api/admin/login', '/api/admin/logout']);

function base64Url(bytes: ArrayBuffer): string {
  const view = new Uint8Array(bytes);
  let binary = '';
  for (let index = 0; index < view.length; index += 1) binary += String.fromCharCode(view[index]);
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

async function verifyAdminSessionEdge(token: string): Promise<boolean> {
  if (!token?.startsWith('adm-')) return false;
  const parts = token.slice(4).split('.');
  if (parts.length !== 3) return false;
  const [adminId, expiresAtText, signature] = parts;
  const expiresAt = Number(expiresAtText);
  if (!adminId || !Number.isFinite(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000)) return false;
  const secret = process.env.JWT_SECRET || 'huitfest-secret-key-2026';
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const digest = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`admin.${adminId}.${expiresAtText}`));
  return base64Url(digest) === signature;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith('/api/admin/') && !publicAdminApi.has(pathname)) {
    const session = request.cookies.get('admin_session')?.value;
    if (!session || !(await verifyAdminSessionEdge(session))) {
      return NextResponse.json({ message: 'Bạn cần đăng nhập quản trị.' }, { status: 401 });
    }
  }
  return NextResponse.next();
}

export const config = { matcher: ['/api/admin/:path*'] };
