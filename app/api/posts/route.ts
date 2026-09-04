import { NextResponse } from 'next/server';
import { getPublicPosts } from '@/lib/service';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;
    const posts = await getPublicPosts(category, search);
    return NextResponse.json(posts, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 });
  }
}
