import { NextResponse } from 'next/server';
import { getTimeline, addTimelineEvent } from '@/lib/service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const timeline = await getTimeline();
    return NextResponse.json(timeline, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created = await addTimelineEvent(body);
    return NextResponse.json(created, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lỗi thêm mốc thời gian' }, { status: 500 });
  }
}
