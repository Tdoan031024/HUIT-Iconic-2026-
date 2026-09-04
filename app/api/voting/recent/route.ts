import { NextResponse } from 'next/server';
import { getLatestPublicVote } from '@/lib/service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const vote = await getLatestPublicVote();
    return NextResponse.json(vote ? [vote] : [], {
      headers: {
        'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=15',
      },
    });
  } catch (error: any) {
    return NextResponse.json([]);
  }
}
