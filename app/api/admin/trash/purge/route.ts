import { NextResponse } from 'next/server';
import { autoPurgeOldTrash } from '@/lib/service';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const days = typeof body.days === 'number' ? body.days : 30;
    await autoPurgeOldTrash(days);
    return NextResponse.json({ success: true, message: `Đã dọn dẹp các mục nằm trong thùng rác quá ${days} ngày.` });
  } catch (error: any) {
    console.error('Error purging old trash:', error);
    return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 });
  }
}
