import nodemailer from 'nodemailer';

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER?.trim();
  const rawPass = process.env.SMTP_PASS?.trim();
  if (!host || !user || !rawPass) return null;

  // Tự động bỏ dấu ngoặc kép và khoảng cách nếu là mật khẩu ứng dụng Gmail (16 ký tự)
  const pass = host.includes('gmail')
    ? rawPass.replace(/["']/g, '').replace(/\s+/g, '')
    : rawPass.replace(/["']/g, '');

  return nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE === 'true' || port === 465,
    auth: { user, pass },
  });
}

export async function sendPasswordResetCode(email: string, code: string) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn(`[PASSWORD_RESET] SMTP chưa cấu hình. Mã thử nghiệm cho ${email}: ${code}`);
    return false;
  }

  const fromAddress = process.env.SMTP_FROM || `"HUIT's ICONIC 2026" <duongdx@huit.edu.vn>`;
  await transporter.sendMail({
    from: fromAddress,
    replyTo: 'duongdx@huit.edu.vn',
    to: email,
    subject: "Mã khôi phục mật khẩu HUIT's ICONIC 2026",
    text: `Mã khôi phục mật khẩu của bạn là: ${code}. Mã có hiệu lực trong 10 phút. Nếu bạn không yêu cầu, hãy bỏ qua email này.`,
    html: `<p>Mã khôi phục mật khẩu của bạn là:</p><p style="font-size:24px;font-weight:700;letter-spacing:6px">${code}</p><p>Mã có hiệu lực trong 10 phút.</p>`,
  });
  return true;
}

export type RegistrationEmailData = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  studentId: string;
  faculty?: string | null;
  major: string;
  className: string;
  gender: string;
  heightCm?: number | null;
  weightKg?: number | null;
  measurementBust?: number | null;
  measurementWaist?: number | null;
  measurementHip?: number | null;
  createdAt: Date | string;
};

export async function sendRegistrationConfirmationEmail(data: RegistrationEmailData): Promise<boolean> {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn(`[REGISTRATION_EMAIL] SMTP chưa cấu hình. Không thể gửi email xác nhận cho: ${data.email}`);
    return false;
  }

  const genderText = data.gender === 'FEMALE' ? 'Nữ' : data.gender === 'MALE' ? 'Nam' : data.gender;
  let submittedTime = 'Vừa xong';
  try {
    const d = new Date(data.createdAt);
    submittedTime = `${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} ngày ${d.toLocaleDateString('vi-VN')}`;
  } catch {}

  const heightWeight = data.heightCm || data.weightKg ? `
    <tr>
      <td style="padding: 6px 0; color: #64748b;">Hình thể:</td>
      <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">
        ${data.heightCm ? data.heightCm + ' cm' : ''}${data.heightCm && data.weightKg ? ' · ' : ''}${data.weightKg ? data.weightKg + ' kg' : ''}
      </td>
    </tr>
  ` : '';

  const subject = `[HUIT's ICONIC 2026] Xác nhận tiếp nhận hồ sơ đăng ký - ${data.fullName}`;

  const textContent = `
Xin chào ${data.fullName},

Chúc mừng bạn đã hoàn thành nộp hồ sơ đăng ký tham gia Cuộc thi Nét đẹp Sinh viên HUIT's ICONIC 2026.
Ban Tổ Chức đã tiếp nhận thông tin hồ sơ của bạn:

- Mã hồ sơ: #${data.id}
- Họ và tên: ${data.fullName}
- Giới tính: ${genderText}
- MSSV: ${data.studentId}
- Khoa / Ngành: ${data.faculty || data.major}
- Lớp: ${data.className}
- Số điện thoại: ${data.phone}
- Email: ${data.email}
- Thời gian nộp: ${submittedTime}
- Trạng thái: Chờ xem xét (PENDING)
- Nhóm Zalo hỗ trợ: https://zalo.me/g/myzijputivfgc1toua9z

Lưu ý: Vui lòng tham gia nhóm Zalo hướng dẫn thí sinh để nhận thông báo khẩn và các hướng dẫn quan trọng từ Ban Tổ Chức:
https://zalo.me/g/myzijputivfgc1toua9z

Quy trình tiếp theo:
1. Ban Tổ Chức sẽ kiểm tra hồ sơ, đối soát thông tin sinh viên HUIT và tiêu chuẩn ngoại hình.
2. Sau khi phê duyệt, bạn sẽ được cấp Số Báo Danh (SBD) chính thức và đưa lên cổng bình chọn website.
3. Kết quả sẽ được gửi qua email này và số điện thoại của bạn.

Thông tin liên hệ Ban Tổ Chức:
- Trưởng BTC: Thầy Đặng Xuân Dương
- Hotline / Zalo: 0974 331 499
- Email: duongdx@huit.edu.vn | media@huit.edu.vn (HUIT Media)
- Địa chỉ: 140 Lê Trọng Tấn, P. Tây Thạnh, Q. Tân Phú, TP.HCM
- Nhóm Zalo hỗ trợ: https://zalo.me/g/myzijputivfgc1toua9z

Trường Đại học Công Thương TP.HCM (HUIT)
Ban Tổ Chức Cuộc thi HUIT's ICONIC 2026
`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Xác nhận tiếp nhận hồ sơ HUIT's ICONIC 2026</title>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;">
    <!-- Header banner -->
    <div style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #831843 100%); padding: 36px 28px; text-align: center; color: #ffffff;">
      <p style="margin: 0 0 8px 0; font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #f472b6;">Trường Đại học Công Thương TP.HCM (HUIT)</p>
      <h1 style="margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 0.5px; line-height: 1.3; color: #ffffff;">HUIT&apos;S ICONIC 2026</h1>
      <p style="margin: 8px 0 0 0; font-size: 13px; color: #cbd5e1; font-weight: 500;">Xác nhận tiếp nhận hồ sơ đăng ký dự thi</p>
    </div>

    <!-- Body content -->
    <div style="padding: 28px 28px 20px 28px;">
      <p style="margin: 0 0 14px 0; font-size: 16px; font-weight: 700; color: #0f172a;">Xin chào <span style="color: #db2777;">${data.fullName}</span>,</p>
      <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #475569;">
        Chúc mừng bạn đã hoàn thành nộp hồ sơ đăng ký tham gia <strong>Cuộc thi Nét đẹp Sinh viên HUIT&apos;s ICONIC 2026</strong>. Ban Tổ Chức đã tiếp nhận thông tin hồ sơ của bạn với chi tiết dưới đây:
      </p>

      <!-- Registration Info Box -->
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px 20px; margin-bottom: 20px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; width: 42%;">Mã hồ sơ:</td>
            <td style="padding: 6px 0; color: #0f172a; font-weight: 900; font-family: monospace;">#${data.id}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Họ và tên thí sinh:</td>
            <td style="padding: 6px 0; color: #0f172a; font-weight: 700;">${data.fullName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Giới tính:</td>
            <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${genderText}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Mã số sinh viên (MSSV):</td>
            <td style="padding: 6px 0; color: #0f172a; font-weight: 700;">${data.studentId}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Khoa đào tạo:</td>
            <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${data.faculty || data.major}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Lớp sinh hoạt:</td>
            <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${data.className}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Số điện thoại:</td>
            <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${data.phone}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Email:</td>
            <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${data.email}</td>
          </tr>
          ${heightWeight}
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Thời gian gửi hồ sơ:</td>
            <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${submittedTime}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Trạng thái hiện tại:</td>
            <td style="padding: 6px 0; color: #d97706; font-weight: 800;">Chờ xem xét (PENDING)</td>
          </tr>
        </table>
      </div>

      <!-- Zalo Support Group Box -->
      <div style="background: linear-gradient(135deg, #eff6ff 0%, #e0f2fe 100%); border: 1px solid #7dd3fc; border-radius: 14px; padding: 20px 22px; margin-bottom: 24px; text-align: center;">
        <p style="margin: 0 0 6px 0; font-size: 14px; font-weight: 800; color: #0369a1;">
          💬 NHÓM ZALO HƯỚNG DẪN &amp; HỖ TRỢ THÍ SINH
        </p>
        <p style="margin: 0 0 14px 0; font-size: 13px; line-height: 1.5; color: #0c4a6e;">
          Vui lòng bấm vào nút bên dưới để tham gia nhóm Zalo thí sinh và nhận các thông báo, lịch trình mới nhất từ Ban Tổ Chức:
        </p>
        <a href="https://zalo.me/g/myzijputivfgc1toua9z" target="_blank" style="display: inline-block; background: #0284c7; color: #ffffff; text-decoration: none; padding: 11px 26px; border-radius: 999px; font-size: 13px; font-weight: 800; box-shadow: 0 4px 14px rgba(2, 132, 199, 0.3);">
          Tham gia nhóm Zalo thí sinh &rarr;
        </a>
        <p style="margin: 10px 0 0 0; font-size: 11px; color: #64748b;">
          Đường dẫn trực tiếp: <a href="https://zalo.me/g/myzijputivfgc1toua9z" style="color: #0284c7; font-weight: 600;">https://zalo.me/g/myzijputivfgc1toua9z</a>
        </p>
      </div>

      <!-- Next Steps Box -->
      <div style="background: #fdf2f8; border-left: 4px solid #db2777; border-radius: 8px; padding: 16px 18px; margin-bottom: 24px;">
        <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 800; text-transform: uppercase; color: #9d174d;">Quy trình xử lý tiếp theo:</p>
        <ol style="margin: 0; padding-left: 18px; font-size: 13px; line-height: 1.6; color: #831843;">
          <li style="margin-bottom: 6px;">Ban Tổ Chức sẽ kiểm tra tính xác thực của thông tin sinh viên HUIT và tiêu chuẩn ngoại hình.</li>
          <li style="margin-bottom: 6px;">Sau khi phê duyệt, hồ sơ của bạn sẽ được cấp <strong>Số Báo Danh (SBD)</strong> chính thức và đưa lên cổng bình chọn trực tuyến.</li>
          <li>Kết quả và các thông báo tiếp theo sẽ được gửi qua email này và số điện thoại của bạn.</li>
        </ol>
      </div>

      <!-- Contact Info Box -->
      <p style="margin: 0 0 8px 0; font-size: 13px; line-height: 1.6; color: #475569;">
        Nếu bạn cần kiểm tra, chỉnh sửa hoặc bổ sung tài liệu hồ sơ, vui lòng liên hệ Ban Tổ Chức:
      </p>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 18px; margin-bottom: 20px; font-size: 13px; line-height: 1.7; color: #0f172a;">
        <p style="margin: 0 0 6px 0; font-weight: 700; color: #0f172a; text-transform: uppercase; font-size: 12px; letter-spacing: 0.5px;">
          Thông tin liên hệ
        </p>
        <div>• <strong>Trưởng BTC:</strong> Thầy Đặng Xuân Dương</div>
        <div>• <strong>Hotline / Zalo:</strong> <a href="tel:0974331499" style="color: #0284c7; text-decoration: none; font-weight: 700;">0974 331 499</a></div>
        <div>• <strong>Email:</strong> <a href="mailto:duongdx@huit.edu.vn" style="color: #2563eb; text-decoration: none; font-weight: 600;">duongdx@huit.edu.vn</a> &middot; <a href="mailto:media@huit.edu.vn" style="color: #2563eb; text-decoration: none; font-weight: 600;">media@huit.edu.vn (HUIT Media)</a></div>
        <div>• <strong>Địa chỉ:</strong> 140 Lê Trọng Tấn, P. Tây Thạnh, Q. Tân Phú, TP.HCM</div>
        <div>• <strong>Nhóm Zalo hỗ trợ:</strong> <a href="https://zalo.me/g/myzijputivfgc1toua9z" style="color: #0284c7; text-decoration: none; font-weight: 600;">zalo.me/g/myzijputivfgc1toua9z</a></div>
      </div>

      <div style="border-top: 1px solid #e2e8f0; padding-top: 18px; text-align: center;">
        <p style="margin: 0; font-size: 12px; color: #94a3b8;">
          Trân trọng,<br>
          <strong style="color: #64748b;">Ban Tổ Chức Cuộc thi HUIT&apos;s ICONIC 2026</strong>
        </p>
      </div>
    </div>

    <!-- Footer note -->
    <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 14px 28px; text-align: center; font-size: 11px; color: #94a3b8;">
      Đây là email tự động từ Hệ thống Cuộc thi HUIT&apos;s ICONIC 2026. Vui lòng không trả lời trực tiếp email này.
    </div>
  </div>
</body>
</html>
  `;

  try {
    const fromAddress = process.env.SMTP_FROM || `"HUIT's ICONIC 2026" <duongdx@huit.edu.vn>`;
    await transporter.sendMail({
      from: fromAddress,
      replyTo: 'duongdx@huit.edu.vn',
      to: data.email,
      subject,
      text: textContent,
      html: htmlContent,
    });
    return true;
  } catch (err) {
    console.error(`[REGISTRATION_EMAIL_ERROR] Không thể gửi email cho ${data.email}:`, err);
    return false;
  }
}
