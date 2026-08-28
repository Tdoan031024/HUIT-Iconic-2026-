function Block({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-slate-200/80 ${className}`} aria-hidden="true" />;
}

export default function Loading() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 sm:py-12" aria-label="Đang tải nội dung">
      <div className="mx-auto max-w-6xl">
        <Block className="h-5 w-36" />
        <Block className="mt-5 h-12 w-3/4 max-w-2xl" />
        <Block className="mt-4 h-5 w-full max-w-xl" />
        <Block className="mt-2 h-5 w-2/3 max-w-lg" />

        <div className="mt-10 grid gap-5 lg:grid-cols-[1.35fr_.65fr]">
          <Block className="aspect-[16/7] w-full rounded-3xl" />
          <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6">
            <Block className="h-5 w-32" />
            <Block className="h-10 w-3/4" />
            <Block className="h-4 w-full" />
            <Block className="h-4 w-5/6" />
            <Block className="mt-4 h-12 w-full" />
          </div>
        </div>

        <div className="mt-10 flex items-end justify-between">
          <div><Block className="h-7 w-52" /><Block className="mt-3 h-4 w-72" /></div>
          <Block className="h-10 w-32" />
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => <div key={item} className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><Block className="aspect-[4/3] rounded-none" /><div className="space-y-3 p-4"><Block className="h-5 w-3/4" /><Block className="h-4 w-1/2" /><Block className="h-10 w-full" /></div></div>)}
        </div>
      </div>
    </main>
  );
}
