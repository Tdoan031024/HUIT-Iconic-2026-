import { NextResponse } from 'next/server';
import { getTimeline } from '@/lib/service';

export async function GET() {
  try {
    const timeline = await getTimeline();
    return NextResponse.json(timeline);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 });
  }
}
