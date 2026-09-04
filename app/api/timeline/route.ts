import { NextResponse } from 'next/server';
import { getTimeline } from '@/lib/service';

export async function GET() {
  try {
    const timeline = await getTimeline();
    return NextResponse.json(timeline, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 });
  }
}
