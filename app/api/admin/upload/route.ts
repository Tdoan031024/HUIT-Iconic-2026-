import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import sharp from 'sharp';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'Không tìm thấy file tải lên.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = path.extname(file.name).toLowerCase();
    const baseName = crypto.randomUUID();

    if (['.mp4', '.webm', '.ogg', '.mov'].includes(ext)) {
      const videoFilename = `${baseName}${ext}`;
      const videoPath = path.join(uploadDir, videoFilename);
      fs.writeFileSync(videoPath, buffer);
      return NextResponse.json({ url: `/uploads/${videoFilename}` });
    }

    const webpFilename = `${baseName}.webp`;
    const webpPath = path.join(uploadDir, webpFilename);

    try {
      await sharp(buffer)
        .rotate()
        .webp({ quality: 82, effort: 4 })
        .toFile(webpPath);
      return NextResponse.json({ url: `/uploads/${webpFilename}` });
    } catch (e) {
      const origFilename = `${baseName}${ext}`;
      fs.writeFileSync(path.join(uploadDir, origFilename), buffer);
      return NextResponse.json({ url: `/uploads/${origFilename}` });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lỗi tải file' }, { status: 500 });
  }
}
