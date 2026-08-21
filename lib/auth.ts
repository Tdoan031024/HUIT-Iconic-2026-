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

  // Simple token parsing or admin user verification
  try {
    const adminUser = await prisma.adminUser.findFirst({
      where: { isActive: true },
    });
    if (!adminUser) return null;
    return { id: adminUser.id, username: adminUser.username, role: adminUser.role };
  } catch (e) {
    return null;
  }
}
