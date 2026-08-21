import { NextResponse } from 'next/server';
import { deleteVoteLogsBulk } from '@/lib/service';

export async function POST(req: Request) {
  try {
    const { ids } = await req.json();
    const result = await deleteVoteLogsBulk(ids || []);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lỗi xóa hàng loạt vote logs' }, { status: 500 });
  }
}
