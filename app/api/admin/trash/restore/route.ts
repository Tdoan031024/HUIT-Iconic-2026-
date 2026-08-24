import { NextResponse } from 'next/server';
import { restoreTrashItem } from '@/lib/service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, id, items } = body;

    if (Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        await restoreTrashItem(item.type, item.id);
      }
      return NextResponse.json({ success: true, count: items.length });
    }

    if (!type || !id) {
      return NextResponse.json({ error: 'Thiếu thông tin type hoặc id' }, { status: 400 });
    }

    const result = await restoreTrashItem(type, id);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error restoring trash item:', error);
    return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 });
  }
}
