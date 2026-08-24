import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'huitfest-secret-key-2026';

export function hashPasswordMd5(value: string): string {
  return crypto.createHash('md5').update(String(value || '')).digest('hex');
}

export function isMd5Hash(value?: string | null): boolean {
  return !!value && /^[a-f0-9]{32}$/i.test(value);
}

export function normalizeEmail(email: string): string {
  const trimmed = String(email || '').trim().toLowerCase();
  const parts = trimmed.split('@');
  if (parts.length !== 2) return trimmed;
  const [localPart, domain] = parts;
  const baseLocal = localPart.split('+')[0];
  return `${baseLocal}@${domain}`;
}

export function generateWebToken(userId: string, secret: string = JWT_SECRET): string {
  const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30; // 30 days
  const payload = `${userId}.${expiresAt}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
  return `web-${payload}.${signature}`;
}

export function generateAdminSessionToken(adminId: string, rememberMe = false, secret: string = JWT_SECRET): string {
  const expiresAt = Math.floor(Date.now() / 1000) + (rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24);
  const payload = `${adminId}.${expiresAt}`;
  const signature = crypto.createHmac('sha256', secret).update(`admin.${payload}`).digest('base64url');
  return `adm-${payload}.${signature}`;
}

export function extractAdminSessionToken(token: string, secret: string = JWT_SECRET): { adminId: string; expiresAt: number } | null {
  if (!token?.startsWith('adm-')) return null;
  const parts = token.slice(4).split('.');
  if (parts.length !== 3) return null;
  const [adminId, expiresAtText, signature] = parts;
  const expiresAt = Number(expiresAtText);
  if (!adminId || !Number.isFinite(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000)) return null;
  const expected = crypto.createHmac('sha256', secret).update(`admin.${adminId}.${expiresAtText}`).digest('base64url');
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(actualBuffer, expectedBuffer)) return null;
  return { adminId, expiresAt };
}

export function extractWebUserFromToken(token: string, secret: string = JWT_SECRET): string | null {
  if (!token) return null;
  if (token.startsWith('local-')) {
    return token.substring(6);
  }
  if (token.startsWith('web-')) {
    const tokenContent = token.slice(4);
    const parts = tokenContent.split('.');
    if (parts.length !== 3) return null;
    const [userId, expiresAtStr, signature] = parts;
    const expiresAt = Number(expiresAtStr);
    if (isNaN(expiresAt) || expiresAt < Math.floor(Date.now() / 1000)) return null;
    const payload = `${userId}.${expiresAtStr}`;
    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '');
    if (expectedSig !== signature) return null;
    return userId;
  }
  return null;
}

export async function verifyAdminSession(authHeader?: string | null, cookieToken?: string | null): Promise<any | null> {
  let token = '';
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (cookieToken) {
    token = cookieToken;
  }

  if (!token) return null;

  try {
    const session = extractAdminSessionToken(token);
    if (!session) return null;
    const adminUser = await prisma.adminUser.findUnique({ where: { id: session.adminId } });
    if (!adminUser || !adminUser.isActive) return null;
    return { id: adminUser.id, username: adminUser.username, role: adminUser.role };
  } catch (e) {
    return null;
  }
}
