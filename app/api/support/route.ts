import { NextResponse } from 'next/server';
import { createSupportTicket } from '@/lib/service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const fields = ['name', 'email', 'subject', 'message'] as const;
    if (fields.some((field) => !String(body?.[field] || '').trim())) {
      return NextResponse.json({ error: 'Vui lòng điền đầy đủ thông tin.' }, { status: 400 });
    }
    if (!/^\S+@\S+\.\S+$/.test(body.email)) {
      return NextResponse.json({ error: 'Email không hợp lệ.' }, { status: 400 });
    }
    await createSupportTicket({ name: body.name.trim(), email: body.email.trim(), subject: body.subject.trim(), message: body.message.trim() });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Không thể gửi yêu cầu.' }, { status: 500 });
  }
}
