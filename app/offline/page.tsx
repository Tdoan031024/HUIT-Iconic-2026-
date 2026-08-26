'use client';

export default function OfflinePage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-6 text-center text-white">
      <section>
        <p className="text-sm font-bold uppercase tracking-[0.24em] text-cyan-300">HUIT&apos;s ICONIC 2026</p>
        <h1 className="mt-4 text-3xl font-black">Bạn đang ngoại tuyến</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/70">Một số nội dung đã lưu vẫn có thể xem được. Hãy kết nối Internet và thử lại để bình chọn hoặc tải dữ liệu mới.</p>
        <button type="button" onClick={() => window.location.reload()} className="mt-7 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-900">Thử lại</button>
      </section>
    </main>
  );
}
