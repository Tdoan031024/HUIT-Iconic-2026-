import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import sharp from 'sharp';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const sbd = params.id || 'temp';
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'Không tìm thấy file.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadDir = path.join(process.cwd(), 'public/duan', sbd);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = path.extname(file.name).toLowerCase();
    const baseName = crypto.randomUUID();

    if (['.mp4', '.webm', '.ogg', '.mov'].includes(ext)) {
      const videoFilename = `${baseName}${ext}`;
      fs.writeFileSync(path.join(uploadDir, videoFilename), buffer);
      return NextResponse.json({ url: `/duan/${sbd}/${videoFilename}` });
    }

    const webpFilename = `${baseName}.webp`;
    const webpPath = path.join(uploadDir, webpFilename);

    try {
      await sharp(buffer)
        .rotate()
        .webp({ quality: 82, effort: 4 })
        .toFile(webpPath);
      return NextResponse.json({ url: `/duan/${sbd}/${webpFilename}` });
    } catch (e) {
      const origFilename = `${baseName}${ext}`;
      fs.writeFileSync(path.join(uploadDir, origFilename), buffer);
      return NextResponse.json({ url: `/duan/${sbd}/${origFilename}` });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lỗi tải file' }, { status: 500 });
  }
}
