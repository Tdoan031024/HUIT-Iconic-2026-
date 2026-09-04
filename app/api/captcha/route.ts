import { NextResponse } from 'next/server';
import { generateCaptcha } from '@/lib/captcha';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const captcha = generateCaptcha();
    return NextResponse.json(captcha, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      },
    });
  } catch (error) {
    console.error('[CAPTCHA_API_ERROR]', error);
    return NextResponse.json({ message: 'Không thể khởi tạo mã xác thực.' }, { status: 500 });
  }
}
