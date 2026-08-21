import { NextResponse } from 'next/server';
import { getWebUsers, addWebUser } from '@/lib/service';

export async function GET() {
  try {
    const users = await getWebUsers();
    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const user = await addWebUser(body);
    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lỗi thêm tài khoản' }, { status: 400 });
  }
}
