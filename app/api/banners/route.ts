import { NextResponse } from 'next/server';
import { getBanners } from '@/lib/service';

export async function GET() {
  try {
    const banners = await getBanners();
    return NextResponse.json(banners);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 });
  }
}
