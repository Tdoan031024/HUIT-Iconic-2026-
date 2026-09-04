import { NextResponse } from 'next/server';
import { loginWebUser } from '@/lib/service';
import { logApiError } from '@/lib/api-error';
import { verifyCaptcha } from '@/lib/captcha';

export async function POST(req: Request) {
  try {
    const { email, password, captchaToken, captchaCode } = await req.json();

    // Xác thực mã CAPTCHA
    const captchaResult = verifyCaptcha(captchaToken, captchaCode);
    if (!captchaResult.success) {
      return NextResponse.json(
        { message: captchaResult.message || 'Mã xác thực CAPTCHA không chính xác.' },
        { status: 400 }
      );
    }

    const result = await loginWebUser(email, password);
    return NextResponse.json(result);
  } catch (error: any) {
    await logApiError(req, 400, error);
    return NextResponse.json({ message: error.message || 'Lỗi đăng nhập' }, { status: 400 });
  }
}
