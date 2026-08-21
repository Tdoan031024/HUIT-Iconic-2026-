import { NextResponse } from 'next/server';
import { getBanners, addBanner } from '@/lib/service';

export async function GET() {
  try {
    const banners = await getBanners();
    return NextResponse.json(banners);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created = await addBanner(body);
    return NextResponse.json(created);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lỗi thêm banner' }, { status: 500 });
  }
}
