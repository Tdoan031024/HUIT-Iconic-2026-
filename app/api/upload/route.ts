import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import sharp from 'sharp';
import { logApiError } from '@/lib/api-error';

const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const MAX_IMAGE_SIZE = 15 * 1024 * 1024; // 15MB
const MAX_IMAGE_PIXELS = 40_000_000;

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'Không tìm thấy tệp ảnh nào được gửi lên.' }, { status: 400 });
    }

    const ext = path.extname(file.name || '').toLowerCase();
    const isImage = ALLOWED_IMAGE_EXTENSIONS.includes(ext);

    if (!isImage) {
      return NextResponse.json(
        { error: `Định dạng tệp "${ext || 'không rõ'}" không được hỗ trợ. Vui lòng chỉ chọn ảnh có định dạng JPG, PNG hoặc WEBP.` },
        { status: 400 }
      );
    }

    if (file.size > MAX_IMAGE_SIZE) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      return NextResponse.json(
        { error: `Dung lượng ảnh (${sizeMb}MB) vượt quá giới hạn tối đa cho phép là 15MB. Vui lòng chọn hoặc nén ảnh nhỏ hơn.` },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const baseName = `${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const webpFilename = `${baseName}.webp`;
    const webpPath = path.join(uploadDir, webpFilename);

    try {
      const image = sharp(buffer);
      const metadata = await image.metadata();
      if (!metadata.width || !metadata.height || metadata.width * metadata.height > MAX_IMAGE_PIXELS) {
        return NextResponse.json(
          { error: 'Độ phân giải ảnh quá lớn (vượt quá 40 triệu điểm ảnh). Vui lòng chọn ảnh khác.' },
          { status: 400 }
        );
      }
      await image
        .rotate()
        .webp({ quality: 90, effort: 4 })
        .toFile(webpPath);
      return NextResponse.json({
        url: `/uploads/${webpFilename}`,
        filename: file.name,
        size: file.size,
        message: 'Tải ảnh lên thành công',
      });
    } catch {
      // Fallback: save original buffer if sharp fails on particular color profiles
      const origFilename = `${baseName}${ext}`;
      fs.writeFileSync(path.join(uploadDir, origFilename), buffer);
      return NextResponse.json({
        url: `/uploads/${origFilename}`,
        filename: file.name,
        size: file.size,
        message: 'Tải ảnh lên thành công',
      });
    }
  } catch (error: any) {
    await logApiError(req, 500, error);
    console.error('Public upload handler error:', error);
    return NextResponse.json({ error: error.message || 'Lỗi máy chủ khi xử lý tệp ảnh tải lên.' }, { status: 500 });
  }
}
