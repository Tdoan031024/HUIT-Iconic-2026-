import type { Metadata } from 'next';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

async function getCandidate(sbd: string) {
  if (!API_BASE) return null;
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
      title: `Thí sinh SBD ${params.sbd} - HUIT's ICONIC 2026`,
      description: "Xem thông tin hồ sơ thí sinh và bình chọn cuộc thi Nét đẹp & Đại sứ Sinh viên HUIT's ICONIC 2026.",
    };
  }

  const title = `${candidate.name} (SBD: ${candidate.sbd}) - HUIT's ICONIC 2026`;
  const description = candidate.description
    ? candidate.description.slice(0, 155)
    : `Thí sinh ${candidate.name} tham gia cuộc thi Nét đẹp & Đại sứ Sinh viên HUIT's ICONIC 2026. Số báo danh: ${candidate.sbd}.`;

  const imageUrl = candidate.imageUrl
    ? (candidate.imageUrl.startsWith('http') ? candidate.imageUrl : `${SITE_URL}${candidate.imageUrl}`)
    : `${SITE_URL}/images/og-default.png`;

  const canonicalUrl = `${SITE_URL}/thi-sinh/${candidate.sbd}`;

  return {
    title,
    description,
    keywords: [candidate.name, candidate.faculty, candidate.sector, 'Nét đẹp sinh viên', "HUIT's ICONIC 2026", 'bình chọn đại sứ'].filter(Boolean).join(', '),
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: 'website',
      title,
      description,
      url: canonicalUrl,
      siteName: "HUIT's ICONIC 2026",
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
