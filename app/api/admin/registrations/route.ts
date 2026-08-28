import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/auth';

async function authorize() {
  return verifyAdminSession(null, cookies().get('admin_session')?.value);
}

export async function GET() {
  if (!await authorize()) return NextResponse.json({ message: 'Chưa đăng nhập quản trị.' }, { status: 401 });
  const registrations = await prisma.candidateRegistration.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(registrations.map((item) => ({
    ...item,
    heightCm: item.heightCm ? Number(item.heightCm) : null,
    weightKg: item.weightKg ? Number(item.weightKg) : null,
    measurementBust: item.measurementBust ? Number(item.measurementBust) : null,
    measurementWaist: item.measurementWaist ? Number(item.measurementWaist) : null,
    measurementHip: item.measurementHip ? Number(item.measurementHip) : null,
  })));
}

export async function PATCH(request: Request) {
  const admin = await authorize();
  if (!admin) return NextResponse.json({ message: 'Chưa đăng nhập quản trị.' }, { status: 401 });
  const body = await request.json();
  if (!body?.id || !['PENDING', 'REVIEWING', 'APPROVED', 'REJECTED'].includes(body.status)) {
    return NextResponse.json({ message: 'Thông tin cập nhật không hợp lệ.' }, { status: 400 });
  }
  const updated = await prisma.candidateRegistration.update({
    where: { id: body.id },
    data: { status: body.status, adminNote: typeof body.adminNote === 'string' ? body.adminNote.trim() || null : undefined },
    select: { id: true, status: true, adminNote: true },
  });
  return NextResponse.json(updated);
}
