import { NextResponse } from 'next/server';
import { changeAdminPassword } from '@/lib/service';

export async function PUT(req: Request) {
  try {
    const { currentPassword, newPassword, adminId } = await req.json();
    const result = await changeAdminPassword(adminId || 'admin-default', currentPassword, newPassword);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Lỗi đổi mật khẩu' }, { status: 400 });
  }
}
