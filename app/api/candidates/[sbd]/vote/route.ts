import { NextResponse } from 'next/server';
import { voteCandidate } from '@/lib/service';

export async function POST(req: Request, { params }: { params: { sbd: string } }) {
  try {
    const body = await req.json().catch(() => ({}));
    const authHeader = req.headers.get('authorization') || undefined;
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    const result = await voteCandidate(params.sbd, body, authHeader, clientIp);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lỗi bình chọn' }, { status: 400 });
  }
}
