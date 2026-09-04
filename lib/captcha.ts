import crypto from 'crypto';

const CAPTCHA_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Tránh các ký tự dễ nhầm lẫn như 0, O, 1, I, l
const CAPTCHA_LENGTH = 5;
const CAPTCHA_TTL_MS = 5 * 60 * 1000; // 5 phút

// Bộ nhớ tạm để chống tấn công replay (sử dụng lại cùng 1 token captcha)
const consumedTokens = new Set<string>();

function cleanupConsumedTokens() {
  if (consumedTokens.size > 2000) {
    consumedTokens.clear();
  }
}

function getSecretKey(): string {
  return process.env.JWT_SECRET || process.env.ADMIN_SESSION_SECRET || 'huit-iconic-captcha-secret-2026';
}

/**
 * Sinh chuỗi ký tự ngẫu nhiên
 */
function randomString(length: number): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    const idx = Math.floor(Math.random() * CAPTCHA_CHARS.length);
    result += CAPTCHA_CHARS[idx];
  }
  return result;
}

/**
 * Sinh mã SVG Captcha bảo mật với độ méo, nhiễu và màu sắc bắt mắt
 */
export function generateCaptcha(): { captchaToken: string; svg: string } {
  cleanupConsumedTokens();

  const code = randomString(CAPTCHA_LENGTH);
  const expiresAt = Date.now() + CAPTCHA_TTL_MS;

  // Ký hash HMAC
  const secret = getSecretKey();
  const hash = crypto
    .createHmac('sha256', secret)
    .update(`${code}:${expiresAt}`)
    .digest('hex');

  const tokenPayload = JSON.stringify({ h: hash, exp: expiresAt });
  const captchaToken = Buffer.from(tokenPayload).toString('base64url');

  // Tạo SVG
  const width = 140;
  const height = 48;

  // Bảng màu rực rỡ, độ tương phản cao trên nền tối
  const colors = ['#38bdf8', '#f43f5e', '#34d399', '#fbbf24', '#a855f7', '#ec4899', '#22d3ee'];

  // Vẽ các đường cong nhiễu (noise bezier lines)
  const lines: string[] = [];
  for (let i = 0; i < 4; i++) {
    const x1 = Math.floor(Math.random() * 20);
    const y1 = Math.floor(Math.random() * height);
    const qx = Math.floor(Math.random() * width);
    const qy = Math.floor(Math.random() * height);
    const x2 = width - Math.floor(Math.random() * 20);
    const y2 = Math.floor(Math.random() * height);
    const lineColor = colors[i % colors.length];
    lines.push(
      `<path d="M ${x1} ${y1} Q ${qx} ${qy} ${x2} ${y2}" stroke="${lineColor}" stroke-width="${1.5 + Math.random()}" fill="none" opacity="0.45" />`
    );
  }

  // Vẽ các chấm nhiễu (noise dots)
  const dots: string[] = [];
  for (let i = 0; i < 30; i++) {
    const cx = Math.floor(Math.random() * width);
    const cy = Math.floor(Math.random() * height);
    const r = (Math.random() * 1.6 + 0.6).toFixed(1);
    const dotColor = colors[Math.floor(Math.random() * colors.length)];
    dots.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${dotColor}" opacity="0.35" />`);
  }

  // Vẽ từng ký tự với góc xoay, kích thước và độ lệch ngẫu nhiên
  const charElements: string[] = [];
  const charSpacing = width / (CAPTCHA_LENGTH + 1);

  for (let i = 0; i < code.length; i++) {
    const char = code[i];
    const x = Math.floor((i + 0.8) * charSpacing);
    const y = 31 + (Math.random() * 6 - 3);
    const rotate = Math.floor(Math.random() * 32 - 16); // Xoay từ -16 đến +16 độ
    const charColor = colors[(i + 1) % colors.length];
    const fontSize = 23 + Math.floor(Math.random() * 4);

    charElements.push(
      `<text x="${x}" y="${y}" font-family="Consolas, Monaco, 'Courier New', monospace, sans-serif" font-size="${fontSize}" font-weight="900" fill="${charColor}" transform="rotate(${rotate} ${x} ${y})" text-anchor="middle" filter="url(#shadow)">${char}</text>`
    );
  }

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="50%" stop-color="#1e1b4b" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="1" dy="1.5" stdDeviation="0.8" flood-color="#000000" flood-opacity="0.6" />
    </filter>
  </defs>
  <rect width="${width}" height="${height}" rx="10" fill="url(#bgGrad)" />
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
      // Đánh dấu đã dùng token này
      consumedTokens.add(h);
      return { success: true };
    }

    return { success: false, message: 'Mã xác thực CAPTCHA không chính xác. Vui lòng thử lại.' };
  } catch (err) {
    return { success: false, message: 'Lỗi kiểm tra mã xác thực CAPTCHA.' };
  }
}
