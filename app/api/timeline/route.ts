import { NextResponse } from 'next/server';
import { getTimeline } from '@/lib/service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const timeline = await getTimeline();
    return NextResponse.json(timeline, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 });
  }
}
