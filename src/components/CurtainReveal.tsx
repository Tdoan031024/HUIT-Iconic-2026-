'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

export function CurtainReveal() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(pathname === '/');
  const [opening, setOpening] = useState(false);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (pathname !== '/') return;

    const mountedAt = performance.now();
    let openTimer: number | undefined;
    let hideTimer: number | undefined;
    let fallbackTimer: number | undefined;

    const openCurtain = () => {
      if (hasStarted.current) return;
      hasStarted.current = true;

      const waitBeforeOpening = Math.max(0, 760 - (performance.now() - mountedAt));
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setVisible(false);
        return;
      }

      openTimer = window.setTimeout(() => setOpening(true), waitBeforeOpening);
      hideTimer = window.setTimeout(() => setVisible(false), waitBeforeOpening + 1120);
    };

    const onLoad = () => openCurtain();
    if (document.readyState === 'complete') {
      window.setTimeout(onLoad, 0);
    } else {
      window.addEventListener('load', onLoad, { once: true });
    }

    // Never leave the visitor behind the curtain if a remote asset is slow.
    fallbackTimer = window.setTimeout(openCurtain, 4500);
    return () => {
      window.removeEventListener('load', onLoad);
      if (openTimer) window.clearTimeout(openTimer);
      if (hideTimer) window.clearTimeout(hideTimer);
      if (fallbackTimer) window.clearTimeout(fallbackTimer);
    };
  }, [pathname]);

  if (pathname !== '/' || !visible) return null;

  return (
    <div className={`curtain-reveal ${opening ? 'is-opening' : ''}`} aria-hidden="true">
      <div className="curtain-panel curtain-panel-left" />
      <div className="curtain-panel curtain-panel-right" />
      <div className="curtain-reveal-center">
        <img src="/images/image.webp" alt="HUIT's ICONIC 2026" />
        <span>HUIT's ICONIC 2026</span>
      </div>
    </div>
  );
}
