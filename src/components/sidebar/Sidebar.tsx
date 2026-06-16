import { useNavigate } from '@tanstack/react-router';
import { LayoutDashboard, Grid3x3, SquareTerminal } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

import { useSidebarLanguage } from './useSidebarLanguage';

interface AppSidebarProps {
  variant?: 'dashboard' | 'lesson';
  activeTab?: 'dashboard' | 'practice';
  onTabChange?: (tab: 'dashboard' | 'practice') => void;
  completedLessons?: number;
  totalLessons?: number;
  isOpen?: boolean;
  onClose?: () => void;
}

/** Sidebar with navigation and learning progress, supporting sliding drawer on mobile. */
export function AppSidebar({
  activeTab,
  onTabChange,
  completedLessons = 12,
  totalLessons = 45,
  isOpen = false,
  onClose,
}: AppSidebarProps) {
  const navigate = useNavigate();
  const { languageLabel } = useSidebarLanguage();

  const progressPercent =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const navItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'practice' as const, label: 'Practice', icon: Grid3x3 },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden animate-in fade-in duration-200"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          'fixed top-14 left-0 bottom-0 w-64 border-r bg-white z-40 transition-transform duration-300 md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="px-4 py-4">
          <div className="rounded-xl bg-sidebar p-4">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <SquareTerminal className="size-5 text-primary" />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-foreground">
                  {languageLabel} Mastery
                </h3>

                <p className="text-xs text-muted-foreground">
                  {completedLessons}/{totalLessons} Lessons Learned
                </p>
              </div>
            </div>

            <Progress value={progressPercent} className="mt-3 h-1.5" />
          </div>
        </div>

        <nav className="flex-1 px-4">
          <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Navigate
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => {
                  onTabChange?.(item.id);
                  void navigate({
                    to: item.id === 'dashboard' ? '/dashboard' : '/practice',
                  });
                  onClose?.(); // Close mobile drawer on navigation
                }}
                className={cn(
                  'mt-1 flex w-full items-center justify-start gap-3 rounded-l-lg rounded-r-none px-4 py-2.5 text-left text-sm font-medium shadow-none transition-colors h-auto cursor-pointer',
                  isActive
                    ? 'bg-primary-second text-primary border-r-4 border-r-primary hover:bg-primary-second hover:text-primary'
                    : 'border-r-4 border-r-transparent text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="size-5" />
                {item.label}
              </Button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
