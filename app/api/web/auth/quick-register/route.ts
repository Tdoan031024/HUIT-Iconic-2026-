import { NextResponse } from 'next/server';
import { quickRegisterWebUser } from '@/lib/service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await quickRegisterWebUser(body);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lỗi đăng ký nhanh' }, { status: 400 });
  }
}
