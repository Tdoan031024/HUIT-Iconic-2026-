import { MetadataRoute } from 'next';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

async function fetchPosts() {
  try {
    const res = await fetch(`${API_BASE}/api/posts`, { next: { revalidate: 3600 } });
    if (res.ok) return (await res.json()) as any[];
  } catch {}
  return [];
}

async function fetchCandidates() {
  try {
    const res = await fetch(`${API_BASE}/api/candidates`, { next: { revalidate: 3600 } });
    if (res.ok) return (await res.json()) as any[];
  } catch {}
  return [];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString();

  // Static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/gioi-thieu`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/the-le`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/thoi-gian`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/bang-xep-hang`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/tin-tuc`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ];

  // Dynamic news post pages
  const posts = await fetchPosts();
  const postRoutes: MetadataRoute.Sitemap = posts
    .filter((p: any) => p.isActive !== false && p.slug)
    .map((p: any) => ({
      url: `${SITE_URL}/tin-tuc/${p.slug}`,
      lastModified: p.updatedAt || p.createdAt || now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

  // Dynamic candidate project pages
  const candidates = await fetchCandidates();
  const candidateRoutes: MetadataRoute.Sitemap = candidates
    .filter((c: any) => c.sbd)
    .map((c: any) => ({
      url: `${SITE_URL}/thi-sinh/${c.sbd}`,
      lastModified: c.updatedAt || now,
      changeFrequency: 'daily' as const,
      priority: 0.6,
    }));

  return [...staticRoutes, ...postRoutes, ...candidateRoutes];
}
