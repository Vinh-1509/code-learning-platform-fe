import { LayoutDashboard, Grid3x3, SquareTerminal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeTab: 'dashboard' | 'practice';
  onTabChange: (tab: 'dashboard' | 'practice') => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-screen fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 pb-4">
        <span className="text-xl font-bold text-primary">CodeStep</span>
      </div>

      {/* Course Card */}
      <div className="px-4 pb-4">
        <div className="bg-sidebar rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="size-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
              <SquareTerminal className="size-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-foreground">
                C++ Mastery
              </h3>
              <p className="text-xs text-muted-foreground">
                12/45 Lessons Learned
              </p>
            </div>
          </div>
          <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full"
              style={{ width: '27%' }}
            />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4">
        <button
          onClick={() => onTabChange('dashboard')}
          className={cn(
            'w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
            activeTab === 'dashboard'
              ? 'bg-accent text-primary'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          <LayoutDashboard className="size-5" />
          Dashboard
        </button>
        <button
          onClick={() => onTabChange('practice')}
          className={cn(
            'w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors mt-1',
            activeTab === 'practice'
              ? 'bg-accent text-primary'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          <Grid3x3 className="size-5" />
          Practice
        </button>
      </nav>
    </aside>
  );
}
