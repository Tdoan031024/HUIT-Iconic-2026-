import { NextResponse } from 'next/server';
import { getAdminVoteLogs } from '@/lib/service';

export async function GET() {
  try {
    const logs = await getAdminVoteLogs();
    return NextResponse.json(logs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 });
  }
}
