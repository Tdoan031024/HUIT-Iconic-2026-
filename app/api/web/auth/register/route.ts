import { NextResponse } from 'next/server';
import { registerWebUserWithSession } from '@/lib/service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await registerWebUserWithSession(body);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lỗi đăng ký' }, { status: 400 });
  }
}
