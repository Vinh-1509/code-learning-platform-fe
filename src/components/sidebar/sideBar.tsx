import { Link } from '@tanstack/react-router';
import {
  LayoutDashboard,
  Grid3x3,
  SquareTerminal,
  ChevronLeft,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface AppSidebarProps {
  variant?: 'dashboard' | 'lesson';
  activeTab?: 'dashboard' | 'practice';
  onTabChange?: (tab: 'dashboard' | 'practice') => void;
  completedLessons?: number;
  totalLessons?: number;
}

export function AppSidebar({
  variant = 'dashboard',
  activeTab,
  onTabChange,
  completedLessons = 12,
  totalLessons = 45,
}: AppSidebarProps) {
  const progressPercent =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <aside className="fixed top-14 left-0 bottom-0 w-64 border-r bg-white">
      {variant === 'dashboard' ? (
        <>
          <div className="px-4 py-4">
            <div className="rounded-xl bg-sidebar p-4">
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <SquareTerminal className="size-5 text-primary" />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-foreground">
                    C++ Mastery
                  </h3>

                  <p className="text-xs text-muted-foreground">
                    {completedLessons}/{totalLessons} Lessons Learned
                  </p>
                </div>
              </div>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          <nav className="flex-1 px-4">
            <Button
              variant="ghost"
              onClick={() => onTabChange?.('dashboard')}
              className={cn(
                'flex w-full items-center gap-3 rounded-l-lg rounded-r-none px-4 py-2.5 text-left text-sm font-medium transition-colors justify-start h-auto shadow-none',
                activeTab === 'dashboard'
                  ? 'bg-[#EAEFFF] text-primary border-r-4 border-r-primary hover:bg-[#EAEFFF] hover:text-primary'
                  : 'border-r-4 border-r-transparent text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <LayoutDashboard className="size-5" />
              Dashboard
            </Button>

            <Button
              variant="ghost"
              onClick={() => onTabChange?.('practice')}
              className={cn(
                'mt-1 flex w-full items-center gap-3 rounded-l-lg rounded-r-none px-4 py-2.5 text-left text-sm font-medium transition-colors justify-start h-auto shadow-none',
                activeTab === 'practice'
                  ? 'bg-[#EAEFFF] text-primary border-r-4 border-r-primary hover:bg-[#EAEFFF] hover:text-primary'
                  : 'border-r-4 border-r-transparent text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Grid3x3 className="size-5" />
              Practice
            </Button>
          </nav>
        </>
      ) : (
        <div className="flex flex-1 flex-col justify-between p-4">
          <div>
            <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Current Lesson
              </p>

              <h3 className="mt-2 text-sm font-semibold text-slate-900">
                Variables & Data Types
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Learn variables, primitive types and basic syntax.
              </p>
            </div>
          </div>

          <Button
            asChild
            variant="outline"
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 h-auto shadow-none"
          >
            <Link to="/dashboard">
              <ChevronLeft className="size-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      )}
    </aside>
  );
}
