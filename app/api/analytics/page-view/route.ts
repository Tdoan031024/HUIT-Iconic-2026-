import { NextResponse } from 'next/server';
import { recordPageView } from '@/lib/service';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const userAgent = req.headers.get('user-agent') || undefined;
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined;
    const result = await recordPageView(body, userAgent, ip);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ ok: true });
  }
}
