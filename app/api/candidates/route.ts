import { NextResponse } from 'next/server';
import { getCandidates, addCandidate } from '@/lib/service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const candidates = await getCandidates();
    return NextResponse.json(candidates, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created = await addCandidate(body);
    return NextResponse.json(created);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lỗi thêm thí sinh' }, { status: 500 });
  }
}
