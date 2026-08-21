import { NextResponse } from 'next/server';
import { getCandidateVotes } from '@/lib/service';

export async function GET(req: Request, { params }: { params: { sbd: string } }) {
  try {
    const votes = await getCandidateVotes(params.sbd);
    return NextResponse.json(votes);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lỗi lấy lượt vote' }, { status: 500 });
  }
}
