import { NextResponse } from 'next/server';
import { bulkImportBanners } from '@/lib/service';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const result = await bulkImportBanners(payload);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lỗi bulk import banner' }, { status: 500 });
  }
}
