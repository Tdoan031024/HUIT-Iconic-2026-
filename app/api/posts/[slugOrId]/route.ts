import { NextResponse } from 'next/server';
import { getPostBySlugOrId } from '@/lib/service';

export async function GET(req: Request, { params }: { params: { slugOrId: string } }) {
  try {
    const post = await getPostBySlugOrId(params.slugOrId);
    if (!post) {
      return NextResponse.json({ message: 'Không tìm thấy bài viết.' }, { status: 404 });
    }
    return NextResponse.json(post);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 });
  }
}
