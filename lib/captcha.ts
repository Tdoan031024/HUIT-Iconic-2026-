import crypto from 'crypto';

const CAPTCHA_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Loại bỏ ký tự dễ nhầm lẫn: 0, O, 1, I, l
const CAPTCHA_LENGTH = 5;
const CAPTCHA_TTL_MS = 5 * 60 * 1000; // 5 phút

const consumedTokens = new Set<string>();

function cleanupConsumedTokens() {
  if (consumedTokens.size > 2000) {
    consumedTokens.clear();
  }
}

function getSecretKey(): string {
  return process.env.JWT_SECRET || process.env.ADMIN_SESSION_SECRET || 'huit-iconic-captcha-secret-2026';
}

function randomString(length: number): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    const idx = Math.floor(Math.random() * CAPTCHA_CHARS.length);
    result += CAPTCHA_CHARS[idx];
  }
  return result;
}

/**
 * Sinh mã SVG Captcha bảo mật, thẩm mỹ cao, độ tương phản rõ nét
 */
export function generateCaptcha(): { captchaToken: string; svg: string } {
  cleanupConsumedTokens();

  const code = randomString(CAPTCHA_LENGTH);
  const expiresAt = Date.now() + CAPTCHA_TTL_MS;

  const secret = getSecretKey();
  const hash = crypto
    .createHmac('sha256', secret)
    .update(`${code}:${expiresAt}`)
    .digest('hex');

  const tokenPayload = JSON.stringify({ h: hash, exp: expiresAt });
  const captchaToken = Buffer.from(tokenPayload).toString('base64url');

  const width = 130;
  const height = 46;

  // Bảng màu sáng rõ, tương phản mạnh trên nền tối
  const colors = ['#38bdf8', '#fb7185', '#34d399', '#fde047', '#c084fc', '#f472b6', '#38bdf8'];

  // 3 đường cong nhiễu nhẹ
  const lines: string[] = [];
  for (let i = 0; i < 3; i++) {
    const x1 = Math.floor(Math.random() * 15);
    const y1 = Math.floor(Math.random() * height);
    const qx = Math.floor(Math.random() * width);
    const qy = Math.floor(Math.random() * height);
    const x2 = width - Math.floor(Math.random() * 15);
    const y2 = Math.floor(Math.random() * height);
    const lineColor = colors[i % colors.length];
    lines.push(
      `<path d="M ${x1} ${y1} Q ${qx} ${qy} ${x2} ${y2}" stroke="${lineColor}" stroke-width="${1.6}" fill="none" opacity="0.4" />`
    );
  }

  // Chấm nhiễu
  const dots: string[] = [];
  for (let i = 0; i < 20; i++) {
    const cx = Math.floor(Math.random() * width);
    const cy = Math.floor(Math.random() * height);
    const r = (Math.random() * 1.4 + 0.6).toFixed(1);
    const dotColor = colors[Math.floor(Math.random() * colors.length)];
    dots.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${dotColor}" opacity="0.3" />`);
  }

  // Từng ký tự với độ nghiêng nhẹ (-12 đến +12 độ) để người dùng đọc dễ dàng
  const charElements: string[] = [];
  const charSpacing = width / (CAPTCHA_LENGTH + 0.6);

  for (let i = 0; i < code.length; i++) {
    const char = code[i];
    const x = Math.floor((i + 0.7) * charSpacing);
    const y = 30 + (Math.random() * 4 - 2);
    const rotate = Math.floor(Math.random() * 24 - 12);
    const charColor = colors[i % colors.length];
    const fontSize = 23 + Math.floor(Math.random() * 3);

    charElements.push(
      `<text x="${x}" y="${y}" font-family="Consolas, Monaco, 'Courier New', monospace, sans-serif" font-size="${fontSize}" font-weight="900" fill="${charColor}" transform="rotate(${rotate} ${x} ${y})" text-anchor="middle">${char}</text>`
    );
  }

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="captchaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090d16" />
      <stop offset="50%" stop-color="#141a2e" />
      <stop offset="100%" stop-color="#090d16" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" rx="10" fill="url(#captchaGrad)" />
  ${lines.join('\n  ')}
  ${dots.join('\n  ')}
  ${charElements.join('\n  ')}
</svg>
  `.trim();

  return { captchaToken, svg };
}

/**
 * Kiểm tra mã xác thực Captcha
 */
export function verifyCaptcha(
  token: string | undefined,
  userInput: string | undefined
): { success: boolean; message?: string } {
  if (!userInput || !userInput.trim()) {
    return { success: false, message: 'Vui lòng nhập mã xác thực (CAPTCHA).' };
  }

  if (!token) {
    return { success: false, message: 'Mã xác thực CAPTCHA không hợp lệ hoặc phiên đã hết.' };
  }

  try {
    const raw = Buffer.from(token, 'base64url').toString('utf-8');
    const { h, exp } = JSON.parse(raw);

    if (!h || !exp || typeof exp !== 'number') {
      return { success: false, message: 'Token xác thực CAPTCHA không hợp lệ.' };
    }

    if (Date.now() > exp) {
      return { success: false, message: 'Mã xác thực CAPTCHA đã hết hạn. Vui lòng bấm đổi mã mới.' };
    }

    if (consumedTokens.has(h)) {
      return { success: false, message: 'Mã CAPTCHA này đã được sử dụng. Vui lòng đổi mã mới.' };
    }

    const cleanInput = userInput.trim().toUpperCase();
    const secret = getSecretKey();
    const expectedHash = crypto
      .createHmac('sha256', secret)
      .update(`${cleanInput}:${exp}`)
      .digest('hex');

    if (crypto.timingSafeEqual(Buffer.from(h), Buffer.from(expectedHash))) {
      consumedTokens.add(h);
      return { success: true };
    }

    return { success: false, message: 'Mã xác thực CAPTCHA không chính xác. Vui lòng thử lại.' };
  } catch (err) {
    return { success: false, message: 'Lỗi kiểm tra mã xác thực CAPTCHA.' };
  }
}
