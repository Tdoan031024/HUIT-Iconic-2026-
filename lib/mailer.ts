import nodemailer from 'nodemailer';

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;

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

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: "Mã khôi phục mật khẩu HUIT's ICONIC 2026",
    text: `Mã khôi phục mật khẩu của bạn là: ${code}. Mã có hiệu lực trong 10 phút. Nếu bạn không yêu cầu, hãy bỏ qua email này.`,
    html: `<p>Mã khôi phục mật khẩu của bạn là:</p><p style="font-size:24px;font-weight:700;letter-spacing:6px">${code}</p><p>Mã có hiệu lực trong 10 phút.</p>`,
  });
  return true;
}
