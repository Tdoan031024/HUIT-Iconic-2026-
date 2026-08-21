import { NextResponse } from 'next/server';
import { getCandidateBySbd } from '@/lib/service';

export async function GET(req: Request, { params }: { params: { sbd: string } }) {
  try {
    const candidate = await getCandidateBySbd(params.sbd);
    return NextResponse.json(candidate);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Không tìm thấy thí sinh' }, { status: 404 });
  }
}
