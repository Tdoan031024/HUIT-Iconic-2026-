'use client';

import { FormEvent, useState } from 'react';

export default function SupportPage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch('/api/support', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    const result = await response.json();
    if (!response.ok) { setError(result.error || 'Không thể gửi yêu cầu.'); return; }
    setSubmitted(true);
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-16 sm:px-6">
      <div className="mb-8 text-center">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--site-primary)]">HUIT&apos;s ICONIC 2026</p>
        <h1 className="mt-3 text-3xl font-black text-[var(--site-text)]">Trung tâm hỗ trợ</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[var(--site-muted)]">Gửi câu hỏi về tài khoản, bình chọn, hồ sơ thí sinh hoặc lịch trình cuộc thi.</p>
      </div>
      {submitted ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center text-emerald-800">Yêu cầu đã được gửi. Ban tổ chức sẽ phản hồi qua email sớm nhất.</div>
      ) : (
        <form onSubmit={submit} className="grid gap-4 rounded-2xl border border-[var(--site-line)] bg-[var(--site-card)] p-5 shadow-sm sm:p-7">
          <input name="name" required placeholder="Họ và tên" className="rounded-xl border border-[var(--site-line)] bg-transparent px-4 py-3 text-sm outline-none focus:border-[var(--site-primary)]" />
          <input name="email" required type="email" placeholder="Email liên hệ" className="rounded-xl border border-[var(--site-line)] bg-transparent px-4 py-3 text-sm outline-none focus:border-[var(--site-primary)]" />
          <input name="subject" required placeholder="Chủ đề cần hỗ trợ" className="rounded-xl border border-[var(--site-line)] bg-transparent px-4 py-3 text-sm outline-none focus:border-[var(--site-primary)]" />
          <textarea name="message" required rows={6} placeholder="Nội dung cần hỗ trợ" className="rounded-xl border border-[var(--site-line)] bg-transparent px-4 py-3 text-sm outline-none focus:border-[var(--site-primary)]" />
          {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
          <button className="rounded-xl bg-[var(--site-primary)] px-5 py-3 text-sm font-bold text-white transition hover:opacity-90">Gửi yêu cầu hỗ trợ</button>
        </form>
      )}
    </main>
  );
}
