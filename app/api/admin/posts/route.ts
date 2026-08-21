import { NextResponse } from 'next/server';
import { getAdminPosts, createPost } from '@/lib/service';

export async function GET() {
  try {
    const posts = await getAdminPosts();
    return NextResponse.json(posts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created = await createPost(body);
    return NextResponse.json(created);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lỗi tạo bài viết' }, { status: 500 });
  }
}
