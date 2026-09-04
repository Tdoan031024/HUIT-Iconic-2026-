import React from 'react';
import ClientPostDetail from './ClientPostDetail';

import { getPostBySlugOrId } from '@/lib/service';
import prisma from '@/lib/prisma';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

async function getPost(slug: string) {
  try {
    const post = await getPostBySlugOrId(slug);
    if (!post) return null;

    // Increment view count asynchronously
    try {
      await prisma.post.update({
        where: { id: post.id },
        data: { views: { increment: 1 } },
      });
    } catch {
      // ignore non-critical view increment errors
    }

    return {
      ...post,
      createdAt: post.createdAt ? post.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: post.updatedAt ? post.updatedAt.toISOString() : undefined,
    };
  } catch (err) {
    console.error(`Error fetching post details for slug: ${slug}`, err);
    return null;
  }
}

async function getRelatedPosts(category: string, currentPostId: string) {
  try {
    const related = await prisma.post.findMany({
      where: {
        category,
        id: { not: currentPostId },
        isActive: true,
        isDeleted: false,
      },
      take: 3,
      orderBy: { createdAt: 'desc' },
    });

    return related.map(p => ({
      ...p,
      createdAt: p.createdAt ? p.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: p.updatedAt ? p.updatedAt.toISOString() : undefined,
    }));
  } catch (err) {
    console.error('Error fetching related posts:', err);
    return [];
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) {
    return {
      title: "Không tìm thấy bài viết - HUIT's ICONIC 2026",
      description: 'Bài viết này không tồn tại hoặc đã bị xóa.',
      robots: 'noindex, nofollow',
    };
  }

  const description = post.summary || `Đọc chi tiết bài viết ${post.title} trên cổng thông tin HUIT's ICONIC 2026.`;
  const imageUrl = post.thumbnailUrl
    ? (post.thumbnailUrl.startsWith('http') ? post.thumbnailUrl : `${SITE_URL}${post.thumbnailUrl}`)
    : `${SITE_URL}/images/og-default.png`;
  const canonicalUrl = `${SITE_URL}/tin-tuc/${post.slug}`;

  return {
    title: `${post.title} - HUIT's ICONIC 2026`,
    description,
    keywords: [post.category, "HUIT's ICONIC", 'tin tức cuộc thi', 'đại sứ truyền thông'].filter(Boolean).join(', '),
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: 'article',
      title: post.title,
      description,
      url: canonicalUrl,
      siteName: "HUIT's ICONIC 2026",
      locale: 'vi_VN',
      images: [{ url: imageUrl, width: 1200, height: 630, alt: post.title }],
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt || post.createdAt,
      section: post.category,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function PostDetailPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  let relatedPosts: any[] = [];
  
  if (post) {
    relatedPosts = await getRelatedPosts(post.category, post.id);
  }

  // Article Schema JSON-LD
  const articleSchema = post ? {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.summary || '',
    image: post.thumbnailUrl
      ? (post.thumbnailUrl.startsWith('http') ? post.thumbnailUrl : `${SITE_URL}${post.thumbnailUrl}`)
      : `${SITE_URL}/images/og-default.png`,
    datePublished: post.createdAt || new Date().toISOString(),
    dateModified: post.updatedAt || post.createdAt || new Date().toISOString(),
    author: {
      '@type': 'Organization',
      name: 'Trường Đại học Công Thương TP.HCM (HUIT)',
      url: 'https://www.huit.edu.vn',
    },
    publisher: {
      '@type': 'Organization',
      name: "HUIT's ICONIC 2026",
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/images/logo-huit.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/tin-tuc/${post.slug}` },
    articleSection: post.category || 'Tin tức',
    inLanguage: 'vi-VN',
  } : null;

  // Breadcrumb Schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Tin tức', item: `${SITE_URL}/tin-tuc` },
      ...(post ? [{ '@type': 'ListItem', position: 3, name: post.title, item: `${SITE_URL}/tin-tuc/${post.slug}` }] : []),
    ],
  };

  return (
    <>
      {articleSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ClientPostDetail post={post} relatedPosts={relatedPosts} />
    </>
  );
}
