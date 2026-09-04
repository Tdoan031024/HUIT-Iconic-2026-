import { NextResponse } from 'next/server';
import { updateSponsor, deleteSponsor } from '@/lib/service';

export const dynamic = 'force-dynamic';

async function handleUpdate(req: Request, params: { id: string }) {
  try {
    const body = await req.json();
    const updated = await updateSponsor(params.id, body);
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lỗi cập nhật nhà tài trợ' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  return handleUpdate(req, params);
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  return handleUpdate(req, params);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  return handleUpdate(req, params);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const result = await deleteSponsor(params.id);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lỗi xóa nhà tài trợ' }, { status: 500 });
  }
}
