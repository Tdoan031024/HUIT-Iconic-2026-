import { NextResponse } from 'next/server';
import { getTrashItems, emptyTrash } from '@/lib/service';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || undefined;
    const items = await getTrashItems(type);
    return NextResponse.json(items);
  } catch (error: any) {
    console.error('Error fetching trash items:', error);
    return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const type = body.type || undefined;
    const result = await emptyTrash(type);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error emptying trash:', error);
    return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 });
  }
}
