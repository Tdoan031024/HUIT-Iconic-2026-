function AdminBlock({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-slate-200 ${className}`} aria-hidden="true" />;
}

export default function AdminLoading() {
  return (
    <main className="min-h-full bg-slate-50 p-5 sm:p-8" aria-label="Đang tải trang quản trị">
      <div className="mx-auto max-w-[1500px]">
        <div className="flex items-end justify-between gap-5"><div><AdminBlock className="h-3 w-28" /><AdminBlock className="mt-3 h-8 w-64" /><AdminBlock className="mt-3 h-4 w-96 max-w-full" /></div><AdminBlock className="h-10 w-36" /></div>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[1, 2, 3, 4].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-white p-5"><AdminBlock className="h-3 w-24" /><AdminBlock className="mt-4 h-9 w-28" /><AdminBlock className="mt-3 h-3 w-20" /></div>)}</div>
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4"><div className="flex gap-3"><AdminBlock className="h-11 flex-1" /><AdminBlock className="h-11 w-32" /><AdminBlock className="h-11 w-28" /></div></div>
        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="grid grid-cols-5 gap-5 bg-slate-50 p-5">{[1, 2, 3, 4, 5].map((item) => <AdminBlock key={item} className="h-3 w-24" />)}</div>{[1, 2, 3, 4, 5, 6].map((item) => <div key={item} className="grid grid-cols-5 gap-5 border-t border-slate-100 p-5"><AdminBlock className="h-10 w-44" /><AdminBlock className="h-8 w-32" /><AdminBlock className="h-8 w-36" /><AdminBlock className="h-8 w-24" /><AdminBlock className="h-8 w-20" /></div>)}</div>
      </div>
    </main>
  );
}
