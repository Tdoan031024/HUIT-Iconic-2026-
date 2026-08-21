import { NextResponse } from 'next/server';
import { getSponsors, addSponsor } from '@/lib/service';

export async function GET() {
  try {
    const sponsors = await getSponsors();
    return NextResponse.json(sponsors);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created = await addSponsor(body);
    return NextResponse.json(created);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lỗi thêm nhà tài trợ' }, { status: 500 });
  }
}
