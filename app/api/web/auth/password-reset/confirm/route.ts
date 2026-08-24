import { NextResponse } from 'next/server';
import { confirmPasswordReset } from '@/lib/service';
import { logApiError } from '@/lib/api-error';

export async function POST(req: Request) {
  try {
    const { email, code, newPassword } = await req.json();
    return NextResponse.json(await confirmPasswordReset(email, code, newPassword));
  } catch (error: any) {
    await logApiError(req, 400, error);
    return NextResponse.json({ message: error.message || 'Không thể đặt lại mật khẩu.' }, { status: 400 });
  }
}
