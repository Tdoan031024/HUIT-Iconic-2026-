import { NextResponse } from 'next/server';
import { loginWebUser } from '@/lib/service';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const result = await loginWebUser(email, password);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Lỗi đăng nhập' }, { status: 400 });
  }
}
