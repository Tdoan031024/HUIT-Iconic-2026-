import { NextResponse } from 'next/server';
import { validateAdminCredentials, logAdminAction } from '@/lib/service';
import { logApiError } from '@/lib/api-error';
import { generateAdminSessionToken } from '@/lib/auth';
import { verifyCaptcha } from '@/lib/captcha';

// In-memory rate limiting for login attempts
interface LoginAttempt {
  count: number;
  lockedUntil?: number;
  lastAttempt: number;
}

const loginAttempts = new Map<string, LoginAttempt>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export async function POST(req: Request) {
  try {
    const { username, password, rememberMe, captchaToken, captchaCode } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ message: 'Thiếu thông tin đăng nhập.' }, { status: 400 });
    }

    // Xác thực mã CAPTCHA
    const captchaResult = verifyCaptcha(captchaToken, captchaCode);
    if (!captchaResult.success) {
      return NextResponse.json(
        { message: captchaResult.message || 'Mã xác thực CAPTCHA không chính xác.' },
        { status: 400 }
      );
    }

    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
    const rateLimitKey = `${clientIp}_${username.trim().toLowerCase()}`;
    const now = Date.now();

    const attempt = loginAttempts.get(rateLimitKey);
    if (attempt && attempt.lockedUntil && attempt.lockedUntil > now) {
      const remainingMinutes = Math.ceil((attempt.lockedUntil - now) / (60 * 1000));
      await logAdminAction(username, 'LOGIN_LOCKED', 'AUTH', undefined, undefined, `Bị chặn đăng nhập do nhập sai quá 5 lần (Còn ${remainingMinutes} phút)`, clientIp);
      return NextResponse.json(
        {
          message: `Bạn đã nhập sai mật khẩu quá ${MAX_ATTEMPTS} lần liên tiếp. Tài khoản tạm thời bị khóa trong ${remainingMinutes} phút để đảm bảo an toàn.`,
        },
        { status: 429 }
      );
    }

    const admin = await validateAdminCredentials(username, password);
    if (!admin) {
      const currentCount = (attempt?.count || 0) + 1;
      const willLock = currentCount >= MAX_ATTEMPTS;
      loginAttempts.set(rateLimitKey, {
        count: currentCount,
        lockedUntil: willLock ? now + LOCKOUT_DURATION_MS : undefined,
        lastAttempt: now,
      });

      await logAdminAction(username, 'LOGIN_FAILED', 'AUTH', undefined, undefined, `Đăng nhập thất bại lần ${currentCount}/${MAX_ATTEMPTS}`, clientIp);

      if (willLock) {
        return NextResponse.json(
          {
            message: `Bạn đã nhập sai quá ${MAX_ATTEMPTS} lần liên tiếp. Hệ thống đã tạm khóa tài khoản trong 15 phút.`,
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          message: `Tên đăng nhập hoặc mật khẩu không chính xác. (Sai ${currentCount}/${MAX_ATTEMPTS} lần)`,
        },
        { status: 401 }
      );
    }

    // Login successful -> clear failed attempts
    loginAttempts.delete(rateLimitKey);

    await logAdminAction(admin.username, 'LOGIN_SUCCESS', 'AUTH', admin.id, admin.username, 'Đăng nhập vào trang quản trị thành công', clientIp);

    const res = NextResponse.json({ ok: true, admin });
    const forwardedProto = req.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
    const isHttps = forwardedProto ? forwardedProto === 'https' : new URL(req.url).protocol === 'https:';
    res.cookies.set('admin_session', generateAdminSessionToken(admin.id, Boolean(rememberMe)), {
      path: '/',
      httpOnly: true,
      // Secure cookies must match the protocol seen by the browser. This also supports HTTP-only cPanel domains.
      secure: isHttps,
      sameSite: 'lax',
      maxAge: rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60,
    });
    return res;
  } catch (error: any) {
    await logApiError(req, 500, error);
    console.error('Login error:', error);
    return NextResponse.json({ message: error.message || 'Lỗi đăng nhập' }, { status: 500 });
  }
}
