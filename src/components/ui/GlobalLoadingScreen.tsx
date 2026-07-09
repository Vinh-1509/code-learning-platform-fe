import { Loader2 } from 'lucide-react';

export function GlobalLoadingScreen() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 animate-in fade-in duration-200">
      <div className="flex flex-col items-center gap-6 max-w-sm text-center px-4">
        {/* Glow pulsing logo */}
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-2xl animate-pulse" />
          <div className="relative bg-primary p-5 rounded-3xl shadow-2xl shadow-primary/20 flex items-center justify-center w-20 h-20 animate-bounce">
            <span className="text-primary-foreground font-bold text-3xl tracking-tighter">
              {'<>'}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            CodeStep
          </h3>
          <div className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span>Loading workspace...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
