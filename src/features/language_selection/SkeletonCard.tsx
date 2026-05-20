export function SkeletonCard() {
  return (
    <div className="flex-1 rounded-2xl overflow-hidden border border-slate-200 animate-pulse">
      <div className="h-36 bg-slate-200" />
      <div className="p-5 space-y-3">
        <div className="h-3 bg-slate-100 rounded w-1/3" />
        <div className="h-3 bg-slate-100 rounded w-2/3" />
        <div className="h-3 bg-slate-100 rounded w-1/2" />
        <div className="h-10 bg-slate-100 rounded-xl mt-4" />
      </div>
    </div>
  );
}
