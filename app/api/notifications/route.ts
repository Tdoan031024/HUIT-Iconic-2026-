import { NextResponse } from 'next/server';
import { getActiveNotifications } from '@/lib/service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json(await getActiveNotifications(), { headers: { 'Cache-Control': 'no-store' } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lỗi tải thông báo' }, { status: 500 });
  }
}
