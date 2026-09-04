import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import sharp from 'sharp';
import { logApiError } from '@/lib/api-error';

const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
const ALLOWED_VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov', '.ogg'];
const MAX_IMAGE_SIZE = 15 * 1024 * 1024; // 15MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_IMAGE_PIXELS = 40_000_000;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'Không tìm thấy file tải lên.' }, { status: 400 });
    }

    const ext = path.extname(file.name).toLowerCase();
    const isImage = ALLOWED_IMAGE_EXTENSIONS.includes(ext);
    const isVideo = ALLOWED_VIDEO_EXTENSIONS.includes(ext);

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: `Định dạng tệp "${ext}" không được hỗ trợ. Vui lòng chọn ảnh (JPG, PNG, WEBP, SVG) hoặc video (MP4, WEBM).` },
        { status: 400 }
      );
    }

    if (isImage && file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json({ error: 'Dung lượng ảnh vượt quá giới hạn 15MB.' }, { status: 400 });
    }

    if (isVideo && file.size > MAX_VIDEO_SIZE) {
      return NextResponse.json({ error: 'Dung lượng video vượt quá giới hạn 50MB.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const baseName = `${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    if (ext === '.mp4') {
      if (buffer.length < 12 || buffer.toString('ascii', 4, 8) !== 'ftyp') {
        return NextResponse.json({ error: 'Video MP4 không hợp lệ.' }, { status: 400 });
      }
      const filename = `${baseName}${ext}`;
      const filePath = path.join(uploadDir, filename);
      fs.writeFileSync(filePath, buffer);
      return NextResponse.json({ url: `/uploads/${filename}`, filename, size: file.size });
    }

    if (ext === '.svg') {
      const webpFilename = `${baseName}.webp`;
      const webpPath = path.join(uploadDir, webpFilename);
      try {
        await sharp(buffer)
          .webp({ quality: 95 })
          .toFile(webpPath);
        return NextResponse.json({ url: `/uploads/${webpFilename}`, filename: webpFilename, size: file.size });
      } catch (svgErr) {
        // If sharp cannot rasterize, save clean sanitized SVG
        const cleanSvg = buffer.toString('utf-8').replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        const filename = `${baseName}.svg`;
        fs.writeFileSync(path.join(uploadDir, filename), Buffer.from(cleanSvg, 'utf-8'));
        return NextResponse.json({ url: `/uploads/${filename}`, filename, size: file.size });
      }
    }

    if (ext === '.gif') {
      const filename = `${baseName}${ext}`;
      const filePath = path.join(uploadDir, filename);
      fs.writeFileSync(filePath, buffer);
      return NextResponse.json({ url: `/uploads/${filename}`, filename, size: file.size });
    }

    const webpFilename = `${baseName}.webp`;
    const webpPath = path.join(uploadDir, webpFilename);

    try {
      const image = sharp(buffer);
      const metadata = await image.metadata();
      if (!metadata.width || !metadata.height || metadata.width * metadata.height > MAX_IMAGE_PIXELS) {
        return NextResponse.json({ error: 'Ảnh vượt quá giới hạn 40 triệu điểm ảnh.' }, { status: 400 });
      }
      await image
        .rotate()
        // Keep small text and logo edges in event banners crisp after conversion.
        .webp({ quality: 92, effort: 4 })
        .toFile(webpPath);
      return NextResponse.json({ url: `/uploads/${webpFilename}`, filename: webpFilename, size: file.size });
    } catch {
      const origFilename = `${baseName}${ext}`;
      fs.writeFileSync(path.join(uploadDir, origFilename), buffer);
      return NextResponse.json({ url: `/uploads/${origFilename}`, filename: origFilename, size: file.size });
    }
  } catch (error: any) {
    await logApiError(req, 500, error);
    console.error('Upload handler error:', error);
    return NextResponse.json({ error: error.message || 'Lỗi xử lý file tải lên' }, { status: 500 });
  }
}
