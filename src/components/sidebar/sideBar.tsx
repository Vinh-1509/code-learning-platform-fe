import { LayoutDashboard, Grid3x3, SquareTerminal } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface AppSidebarProps {
  variant?: 'dashboard' | 'lesson';
  activeTab?: 'dashboard' | 'practice';
  onTabChange?: (tab: 'dashboard' | 'practice') => void;
  completedLessons?: number;
  totalLessons?: number;
  isOpen?: boolean;
  onClose?: () => void;
}

/**
 * AppSidebar component renders the main navigation sidebar for the dashboard.
 * Displays user progress statistics and navigation buttons (Dashboard and Practice)
 * styled with shadcn Buttons and custom theme colors.
 * Supports sliding drawer on mobile/tablet viewports and standard sidebar on desktop.
 *
 * @param {AppSidebarProps} props - The component properties.
 * @param {string} [props.activeTab] - The currently active tab identifier.
 * @param {Function} [props.onTabChange] - Callback to handle switching between tabs.
 * @param {number} [props.completedLessons] - Number of lessons completed.
 * @param {number} [props.totalLessons] - Total lessons in the course.
 * @param {boolean} [props.isOpen=false] - Flag indicating if the drawer is open on mobile.
 * @param {Function} [props.onClose] - Callback function to close the mobile drawer.
 * @returns {JSX.Element} The rendered sidebar component.
 */
export function AppSidebar({
  activeTab,
  onTabChange,
  completedLessons = 12,
  totalLessons = 45,
  isOpen = false,
  onClose,
}: AppSidebarProps) {
  const progressPercent =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

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
                  C++ Mastery
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
          <Button
            variant="ghost"
            onClick={() => onTabChange?.('dashboard')}
            className={cn(
              'flex w-full items-center gap-3 rounded-l-lg rounded-r-none px-4 py-2.5 text-left text-sm font-medium transition-colors justify-start h-auto shadow-none cursor-pointer',
              activeTab === 'dashboard'
                ? 'bg-primary-second text-primary border-r-4 border-r-primary hover:bg-primary-second hover:text-primary'
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
              'mt-1 flex w-full items-center gap-3 rounded-l-lg rounded-r-none px-4 py-2.5 text-left text-sm font-medium transition-colors justify-start h-auto shadow-none cursor-pointer',
              activeTab === 'practice'
                ? 'bg-primary-second text-primary border-r-4 border-r-primary hover:bg-primary-second hover:text-primary'
                : 'border-r-4 border-r-transparent text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Grid3x3 className="size-5" />
            Practice
          </Button>
        </nav>
      </aside>
    </>
  );
}
