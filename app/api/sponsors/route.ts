import { NextResponse } from 'next/server';
import { getSponsors } from '@/lib/service';

export async function GET() {
  try {
    const sponsors = await getSponsors();
    return NextResponse.json(sponsors);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 });
  }
}
