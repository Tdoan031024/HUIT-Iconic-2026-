import { NextResponse } from 'next/server';
import { getFreeVoteQuota } from '@/lib/service';

export async function GET(req: Request, { params }: { params: { userId: string } }) {
  try {
    const quota = await getFreeVoteQuota(params.userId);
    return NextResponse.json(quota);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 });
  }
}
