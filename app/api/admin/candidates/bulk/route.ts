import { NextResponse } from 'next/server';
import { bulkImportCandidates } from '@/lib/service';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const result = await bulkImportCandidates(payload);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lỗi bulk import' }, { status: 500 });
  }
}
