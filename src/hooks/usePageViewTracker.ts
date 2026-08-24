'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function usePageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const url = pathname + (window.location.search || '');
    const gtag = (window as any).gtag;

    if (typeof gtag === 'function') {
      gtag('event', 'page_view', {
        page_path: url,
        page_title: document.title,
      });
    }

    try {
      const storageKey = 'huit_visitor_id';
      let visitorId = localStorage.getItem(storageKey);

      if (!visitorId) {
        visitorId = `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
        localStorage.setItem(storageKey, visitorId);
      }

      const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || '';
      const endpoint = `${apiBase}/api/analytics/page-view`;

      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
        body: JSON.stringify({
          visitorId,
          path: url,
          referrer: document.referrer || null,
        }),
      }).catch(() => {});
    } catch {
      // Analytics must never block the public site.
    }
  }, [pathname]);
}
