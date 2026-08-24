import { NextResponse } from 'next/server';
import { getAnalyticsSummary } from '@/lib/service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const summary = await getAnalyticsSummary();
    return NextResponse.json(summary, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 });
  }
}
