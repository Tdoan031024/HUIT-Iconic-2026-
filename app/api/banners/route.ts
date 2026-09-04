import { NextResponse } from 'next/server';
import { getBanners } from '@/lib/service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const banners = await getBanners();
    return NextResponse.json(banners, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 });
  }
}
