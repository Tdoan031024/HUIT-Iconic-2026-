'use client';

import { useEffect, useState } from 'react';

type NotificationItem = { id: string; title: string; message: string; type: string; createdAt: string };

export function NotificationBell() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await fetch('/api/notifications', { cache: 'no-store' });
        if (response.ok && active) setItems(await response.json());
      } catch {}
    };
    load();
    const interval = setInterval(load, 30000);
    return () => { active = false; clearInterval(interval); };
  }, []);

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((value) => !value)} aria-label="Thông báo" title="Thông báo" className="relative grid h-9 w-9 place-items-center rounded-xl border border-slate-200/70 text-[var(--site-text)] transition hover:border-[var(--site-primary)]">
        <span aria-hidden="true">🔔</span>
        {items.length > 0 && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />}
      </button>
      {open && <div className="absolute right-0 top-11 z-[1200] w-80 rounded-2xl border border-slate-200 bg-white p-3 text-slate-900 shadow-2xl">
        <p className="border-b border-slate-100 px-2 pb-2 text-xs font-black uppercase tracking-wider">Thông báo mới</p>
        <div className="max-h-72 overflow-y-auto">
          {items.length === 0 ? <p className="px-2 py-5 text-center text-xs text-slate-500">Chưa có thông báo.</p> : items.map((item) => (
            <article key={item.id} className="border-b border-slate-100 px-2 py-3 last:border-0">
              <h3 className="text-xs font-bold">{item.title}</h3>
              <p className="mt-1 text-xs leading-5 text-slate-600">{item.message}</p>
            </article>
          ))}
        </div>
      </div>}
    </div>
  );
}
