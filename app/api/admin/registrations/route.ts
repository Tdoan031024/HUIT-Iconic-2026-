import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/auth';
import { logAdminAction } from '@/lib/service';

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

  // Bulk status update
  if (Array.isArray(body?.ids) && body.ids.length > 0 && ['PENDING', 'REVIEWING', 'APPROVED', 'REJECTED'].includes(body.status)) {
    const result = await prisma.candidateRegistration.updateMany({
      where: { id: { in: body.ids } },
      data: { status: body.status },
    });
    await logAdminAction(
      admin.username || 'admin',
      'BULK_UPDATE_STATUS',
      'CANDIDATE_REGISTRATION',
      body.ids.join(','),
      `${body.ids.length} hồ sơ`,
      `Cập nhật trạng thái ${body.status} cho ${body.ids.length} hồ sơ đăng ký`
    );
    return NextResponse.json({ success: true, count: result.count });
  }

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

export async function POST(request: Request) {
  const admin = await authorize();
  if (!admin) return NextResponse.json({ message: 'Chưa đăng nhập quản trị.' }, { status: 401 });

  try {
    const body = await request.json();
    const action = body?.action;

    if (action === 'APPROVE_AND_CONVERT') {
      const registrationId = String(body.registrationId || '').trim();
      const sbd = String(body.sbd || '').trim();
      const contestTable = body.contestTable ? String(body.contestTable).trim() : null;

      if (!registrationId) {
        return NextResponse.json({ message: 'Thiếu ID hồ sơ đăng ký.' }, { status: 400 });
      }
      if (!sbd) {
        return NextResponse.json({ message: 'Vui lòng nhập Số Báo Danh (SBD) cho thí sinh.' }, { status: 400 });
      }

      const reg = await prisma.candidateRegistration.findUnique({
        where: { id: registrationId },
      });

      if (!reg) {
        return NextResponse.json({ message: 'Không tìm thấy hồ sơ đăng ký.' }, { status: 404 });
      }

      // Check if SBD already exists
      const existingCandidate = await prisma.candidate.findFirst({
        where: { sbd, isDeleted: false },
      });
      if (existingCandidate) {
        return NextResponse.json({ message: `Số Báo Danh "${sbd}" đã được sử dụng bởi thí sinh khác.` }, { status: 400 });
      }

      const table = contestTable || (reg.gender === 'MALE' ? 'MALE' : 'FEMALE');
      const tableLabel = table === 'MALE' ? 'Bảng Nam' : table === 'FEMALE' ? 'Bảng Nữ' : 'Bảng Sinh viên';

      const showcase = [reg.portraitImageUrl, reg.fullBodyImageUrl].filter(Boolean);

      // Create candidate
      const candidate = await prisma.candidate.create({
        data: {
          sbd,
          name: reg.fullName,
          votes: 0,
          imageUrl: reg.portraitImageUrl,
          description: reg.selfIntroduction || reg.inspirationalMessage || `Thí sinh ${reg.fullName} - ${reg.major}`,
          biography: reg.inspirationalMessage ? `Thông điệp truyền cảm hứng: "${reg.inspirationalMessage}"` : null,
          contestTable: table,
          contestTableLabel: tableLabel,
          currentRound: 'Vòng loại',
          representativeSchool: 'Trường Đại học Công Thương TP.HCM (HUIT)',
          leaderEmail: reg.email,
          leaderPhone: reg.phone,
          sector: reg.faculty || reg.major,
          showcaseImages: JSON.stringify(showcase),
          status: 'Đủ hồ sơ',
          gender: reg.gender,
          faculty: reg.faculty,
          className: reg.className,
          studentId: reg.studentId,
          heightCm: reg.heightCm,
          weightKg: reg.weightKg,
          measurementBust: reg.measurementBust,
          measurementWaist: reg.measurementWaist,
          measurementHip: reg.measurementHip,
          inspirationalMessage: reg.inspirationalMessage,
          videoUrl: reg.videoUrl,
          talent: reg.talent,
          achievements: reg.achievements,
          registrationId: reg.id,
          source: 'WEB',
          isDeleted: false,
        },
      });

      // Update registration
      const updatedReg = await prisma.candidateRegistration.update({
        where: { id: reg.id },
        data: {
          status: 'APPROVED',
          assignedSbd: sbd,
          candidateId: candidate.id,
        },
      });

      await logAdminAction(
        admin.username || 'admin',
        'APPROVE_AND_CONVERT',
        'CANDIDATE_REGISTRATION',
        reg.id,
        reg.fullName,
        `Duyệt hồ sơ và cấp SBD ${sbd} tạo thí sinh chính thức ID: ${candidate.id}`
      );

      return NextResponse.json({
        success: true,
        message: `Đã duyệt hồ sơ và cấp SBD ${sbd} thành công. Thí sinh đã được đưa vào hệ thống bình chọn!`,
        candidate,
        registration: updatedReg,
      });
    }

    return NextResponse.json({ message: 'Hành động không hợp lệ.' }, { status: 400 });
  } catch (error: any) {
    console.error('Admin registrations POST error:', error);
    return NextResponse.json({ message: error.message || 'Lỗi server xử lý hồ sơ.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const admin = await authorize();
  if (!admin) return NextResponse.json({ message: 'Chưa đăng nhập quản trị.' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const idsBody = await request.json().catch(() => null);
    const ids: string[] = Array.isArray(idsBody?.ids) ? idsBody.ids : id ? [id] : [];

    if (ids.length === 0) {
      return NextResponse.json({ message: 'Vui lòng cung cấp ID hồ sơ cần xóa.' }, { status: 400 });
    }

    const regs = await prisma.candidateRegistration.findMany({
      where: { id: { in: ids } },
      select: { id: true, fullName: true, candidateId: true },
    });

    if (regs.length === 0) {
      return NextResponse.json({ message: 'Không tìm thấy hồ sơ để xóa.' }, { status: 404 });
    }

    await prisma.candidateRegistration.deleteMany({
      where: { id: { in: ids } },
    });

    for (const reg of regs) {
      await logAdminAction(
        admin.username || 'admin',
        'DELETE',
        'CANDIDATE_REGISTRATION',
        reg.id,
        reg.fullName,
        `Xóa hồ sơ đăng ký của ứng viên ${reg.fullName} (ID: ${reg.id})`
      );
    }

    return NextResponse.json({
      success: true,
      message: `Đã xóa thành công ${regs.length} hồ sơ đăng ký.`,
      count: regs.length,
    });
  } catch (error: any) {
    console.error('Admin registrations DELETE error:', error);
    return NextResponse.json({ message: error.message || 'Lỗi server khi xóa hồ sơ.' }, { status: 500 });
  }
}
