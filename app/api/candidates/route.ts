import { NextResponse } from 'next/server';
import { getCandidates } from '@/lib/service';

export async function GET() {
  try {
    const candidates = await getCandidates();
    return NextResponse.json(candidates, {
      headers: {
        'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=30',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 });
  }
}
