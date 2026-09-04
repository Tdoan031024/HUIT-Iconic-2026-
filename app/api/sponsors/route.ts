import { NextResponse } from 'next/server';
import { getSponsors } from '@/lib/service';

export async function GET() {
  try {
    const sponsors = await getSponsors();
    return NextResponse.json(sponsors, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 });
  }
}
