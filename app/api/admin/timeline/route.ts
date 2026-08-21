import { NextResponse } from 'next/server';
import { getTimeline, addTimelineEvent } from '@/lib/service';

export async function GET() {
  try {
    const timeline = await getTimeline();
    return NextResponse.json(timeline);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created = await addTimelineEvent(body);
    return NextResponse.json(created);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lỗi thêm mốc thời gian' }, { status: 500 });
  }
}
