import { NextResponse } from 'next/server';
import { updateSponsor, deleteSponsor } from '@/lib/service';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const updated = await updateSponsor(params.id, body);
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lỗi cập nhật nhà tài trợ' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const result = await deleteSponsor(params.id);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lỗi xóa nhà tài trợ' }, { status: 500 });
  }
}
