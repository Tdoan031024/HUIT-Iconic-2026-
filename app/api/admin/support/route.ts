import { NextResponse } from 'next/server';
import { getSupportTickets } from '@/lib/service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json(await getSupportTickets(), { headers: { 'Cache-Control': 'no-store' } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lỗi tải yêu cầu hỗ trợ' }, { status: 500 });
  }
}
