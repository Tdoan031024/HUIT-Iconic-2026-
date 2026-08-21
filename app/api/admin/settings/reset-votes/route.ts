import { NextResponse } from 'next/server';
import { resetVotes } from '@/lib/service';

export async function POST() {
  try {
    const result = await resetVotes();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 });
  }
}
