import { NextResponse } from 'next/server';
import { validateAdminCredentials } from '@/lib/service';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ message: 'Thiếu thông tin đăng nhập.' }, { status: 400 });
    }

    const admin = await validateAdminCredentials(username, password);
    if (!admin) {
      return NextResponse.json({ message: 'Tên đăng nhập hoặc mật khẩu không chính xác.' }, { status: 401 });
    }

    const res = NextResponse.json({ ok: true, admin });
    res.cookies.set('admin_session', admin.id, { path: '/', httpOnly: true });
    return res;
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Lỗi đăng nhập' }, { status: 500 });
  }
}
