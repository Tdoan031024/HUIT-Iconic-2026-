import { NextResponse } from 'next/server';
import { getPublicSettings } from '@/lib/service';

// Public settings include admin-editable logos and must never be frozen at build time.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const settings = await getPublicSettings();
    return NextResponse.json(settings, {
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=60',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 });
  }
}
