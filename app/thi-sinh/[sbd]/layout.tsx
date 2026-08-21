import type { Metadata } from 'next';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

async function getCandidate(sbd: string) {
  try {
    const res = await fetch(`${API_BASE}/api/candidates/${sbd}`, { next: { revalidate: 120 } });
    if (res.ok) return await res.json();
  } catch {}
  return null;
}

export async function generateMetadata({ params }: { params: { sbd: string } }): Promise<Metadata> {
  const candidate = await getCandidate(params.sbd);

  if (!candidate) {
    return {
      title: `Dự án #${params.sbd} - HUIT Startup 2026`,
      description: 'Xem chi tiết dự án tham gia cuộc thi HUIT Startup 2026.',
    };
  }

  const title = `${candidate.name} (${candidate.sbd}) - HUIT Startup 2026`;
  const description = candidate.description
    ? candidate.description.slice(0, 155)
    : `Dự án ${candidate.name} tham gia cuộc thi khởi nghiệp HUIT Startup 2026. Mã dự án: ${candidate.sbd}.`;

  const imageUrl = candidate.imageUrl
    ? (candidate.imageUrl.startsWith('http') ? candidate.imageUrl : `${SITE_URL}${candidate.imageUrl}`)
    : `${SITE_URL}/images/og-default.png`;

  const canonicalUrl = `${SITE_URL}/thi-sinh/${candidate.sbd}`;

  return {
    title,
    description,
    keywords: [candidate.name, candidate.sector, 'dự án khởi nghiệp', 'HUIT Startup 2026', 'bình chọn'].filter(Boolean).join(', '),
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: 'website',
      title,
      description,
      url: canonicalUrl,
      siteName: 'HUIT Startup 2026',
      locale: 'vi_VN',
      images: [{ url: imageUrl, width: 1200, height: 630, alt: candidate.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
