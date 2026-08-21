import { NextResponse } from 'next/server';
import { getVotePackages } from '@/lib/service';

export async function GET() {
  try {
    const packages = getVotePackages();
    return NextResponse.json(packages);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 });
  }
}
