import { NextResponse } from 'next/server';
import { deleteVoteLog } from '@/lib/service';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const result = await deleteVoteLog(params.id);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lỗi xóa nhật ký vote' }, { status: 500 });
  }
}
