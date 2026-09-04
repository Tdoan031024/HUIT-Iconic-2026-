import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendRegistrationConfirmationEmail } from '@/lib/mailer';

const requiredFields = [
  'fullName', 'gender', 'major', 'className', 'studentId', 'placeOfBirth',
  'identityNumber', 'identityIssuedPlace', 'address', 'phone', 'email',
  'facebookUrl', 'portraitImageUrl', 'fullBodyImageUrl',
] as const;

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function optionalText(value: unknown) {
  const valueText = text(value);
  return valueText || null;
}

function optionalDate(value: unknown) {
  const valueText = text(value);
  if (!valueText) return null;
  const date = new Date(`${valueText}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function optionalNumber(value: unknown) {
  const valueText = text(value);
  if (!valueText) return null;
  const number = Number(valueText);
  return Number.isFinite(number) && number > 0 ? number : null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const missing = requiredFields.find((field) => !text(body?.[field]));
    if (missing) {
      return NextResponse.json({ message: 'Vui lòng hoàn thành tất cả trường bắt buộc.' }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text(body.email))) {
      return NextResponse.json({ message: 'Địa chỉ email không hợp lệ.' }, { status: 400 });
    }
    if (!/^0\d{9,10}$/.test(text(body.phone))) {
      return NextResponse.json({ message: 'Số điện thoại không hợp lệ.' }, { status: 400 });
    }
    if (!body.consentAccepted) {
      return NextResponse.json({ message: 'Bạn cần xác nhận các cam kết của thí sinh.' }, { status: 400 });
    }

    const existing = await prisma.candidateRegistration.findFirst({
      where: { email: text(body.email).toLowerCase(), status: { in: ['PENDING', 'APPROVED'] } },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json({ message: 'Email này đã có hồ sơ đăng ký đang được tiếp nhận.' }, { status: 409 });
    }

    const registration = await prisma.candidateRegistration.create({
      data: {
        fullName: text(body.fullName),
        gender: text(body.gender),
        dateOfBirth: optionalDate(body.dateOfBirth),
        faculty: optionalText(body.faculty),
        major: text(body.major),
        className: text(body.className),
        studentId: text(body.studentId),
        placeOfBirth: text(body.placeOfBirth),
        identityNumber: text(body.identityNumber),
        identityIssuedDate: optionalDate(body.identityIssuedDate),
        identityIssuedPlace: text(body.identityIssuedPlace),
        address: text(body.address),
        phone: text(body.phone),
        email: text(body.email).toLowerCase(),
        facebookUrl: optionalText(body.facebookUrl),
        videoUrl: optionalText(body.videoUrl),
        talent: optionalText(body.talent),
        achievements: optionalText(body.achievements),
        selfIntroduction: optionalText(body.selfIntroduction),
        inspirationalMessage: optionalText(body.inspirationalMessage),
        facultyIntroduction: optionalText(body.facultyIntroduction),
        ambassadorPlan: optionalText(body.ambassadorPlan),
        portraitImageUrl: text(body.portraitImageUrl),
        fullBodyImageUrl: text(body.fullBodyImageUrl),
        heightCm: optionalNumber(body.heightCm),
        weightKg: optionalNumber(body.weightKg),
        measurementBust: optionalNumber(body.measurementBust),
        measurementWaist: optionalNumber(body.measurementWaist),
        measurementHip: optionalNumber(body.measurementHip),
        consentAccepted: true,
      },
      select: { id: true, createdAt: true },
    });

    try {
      await sendRegistrationConfirmationEmail({
        id: registration.id,
        fullName: text(body.fullName),
        email: text(body.email).toLowerCase(),
        phone: text(body.phone),
        studentId: text(body.studentId),
        faculty: optionalText(body.faculty),
        major: text(body.major),
        className: text(body.className),
        gender: text(body.gender),
        heightCm: optionalNumber(body.heightCm),
        weightKg: optionalNumber(body.weightKg),
        measurementBust: optionalNumber(body.measurementBust),
        measurementWaist: optionalNumber(body.measurementWaist),
        measurementHip: optionalNumber(body.measurementHip),
        createdAt: registration.createdAt,
      });
    } catch (emailErr) {
      console.error('[REGISTRATION_EMAIL_ERROR] Không thể gửi email xác nhận:', emailErr);
    }

    return NextResponse.json({
      success: true,
      registrationId: registration.id,
      createdAt: registration.createdAt,
      message: 'Hồ sơ đã được gửi thành công. Ban tổ chức đã gửi email xác nhận đến hòm thư của bạn.',
    }, { status: 201 });
  } catch (error) {
    console.error('Candidate registration error:', error);
    return NextResponse.json({ message: 'Không thể gửi hồ sơ lúc này. Vui lòng thử lại sau.' }, { status: 500 });
  }
}
