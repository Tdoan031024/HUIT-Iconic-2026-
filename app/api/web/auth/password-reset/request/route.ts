import { NextResponse } from 'next/server';
import { requestPasswordReset } from '@/lib/service';
import { logApiError } from '@/lib/api-error';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ message: 'Vui lòng nhập email.' }, { status: 400 });
    return NextResponse.json(await requestPasswordReset(email));
  } catch (error: any) {
    await logApiError(req, 500, error);
    return NextResponse.json({ message: 'Không thể xử lý yêu cầu lúc này.' }, { status: 500 });
  }
}
