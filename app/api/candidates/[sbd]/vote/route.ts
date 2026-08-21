import { NextResponse } from 'next/server';
import { voteCandidate } from '@/lib/service';

export async function POST(req: Request, { params }: { params: { sbd: string } }) {
  try {
    const body = await req.json().catch(() => ({}));
    const authHeader = req.headers.get('authorization') || undefined;
    const result = await voteCandidate(params.sbd, body, authHeader);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lỗi bình chọn' }, { status: 500 });
  }
}
