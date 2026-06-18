import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ChevronLeft, User, Menu, Code } from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavbarProps {
  variant?: 'dashboard' | 'lesson' | 'practice';
  onToggleSidebar?: () => void;
  activeTab?: 'theory' | 'practice';
  onChangeTab?: (tab: 'theory' | 'practice') => void;
}

const Navbar = ({
  variant = 'dashboard',
  onToggleSidebar,
  activeTab,
  onChangeTab,
}: NavbarProps) => {
  const { logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Quick config for back buttons to reduce repetitive JSX
  const isLesson = variant === 'lesson';
  const isPractice = variant === 'practice';
  const backTo = isPractice ? '/practice' : '/dashboard';
  const backLabel = isPractice ? 'Back to Practice' : 'Back to Dashboard';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-14 bg-card border-b border-border select-none">
      {/* LEFT: Logo & Sidebar Toggles */}
      <div className="flex items-center gap-2">
        {/* Dashboard Sidebar Toggle */}
        {variant === 'dashboard' && onToggleSidebar && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="md:hidden -ml-2 h-9 w-9 text-muted-foreground"
          >
            <Menu className="size-5" />
          </Button>
        )}

        {/* Lesson Sidebar Toggle */}
        {variant === 'lesson' && onToggleSidebar && (
          <Button
            type="button"
            onClick={onToggleSidebar}
            className="lg:hidden flex items-center justify-center size-9 bg-primary text-primary-foreground rounded-xl shadow p-0"
          >
            <Code className="size-5" />
          </Button>
        )}

        {/* Clickable Logo with smooth Hover & Click (Active) animation */}
        <Link
          to="/dashboard"
          className={cn(
            'inline-block transition-all duration-200 ease-out transform hover:scale-105 active:scale-95 active:opacity-80 cursor-pointer',
            variant === 'lesson' && 'hidden lg:inline-block'
          )}
        >
          <span className="text-xl font-black text-primary tracking-tight select-none">
            CodeStep
          </span>
        </Link>
      </div>
      {/* MIDDLE: Mobile View Switcher (Learn / Code) */}
      {isLesson && activeTab && onChangeTab && (
        <div className="lg:hidden flex border border-border rounded-lg p-0.5 bg-card">
          {(['theory', 'practice'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => onChangeTab(tab)}
              className={cn(
                'px-4 py-1 text-sm font-semibold rounded-md transition-all h-8 flex items-center justify-center cursor-pointer',
                activeTab === tab
                  ? 'border border-orange-400 text-orange-500 bg-card shadow-sm font-bold'
                  : 'border border-transparent text-slate-300 bg-transparent'
              )}
            >
              {tab === 'theory' ? 'Learn' : 'Code'}
            </button>
          ))}
        </div>
      )}

      {/* RIGHT: Actions / Profile Menu */}
      <div className="flex items-center gap-3">
        {/* Desktop Back Buttons (Shared Logic) */}
        {(isLesson || isPractice) && (
          <Link to={backTo} className="hidden lg:block">
            <Button
              type="button"
              variant="secondary"
              className="flex items-center gap-1 rounded-lg px-4 h-9 bg-trueaccent text-primary text-sm font-semibold hover:bg-accent transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              {backLabel}
            </Button>
          </Link>
        )}

        {/* Mobile Dropdown Menu for Lesson View */}
        {isLesson && (
          <div className="lg:hidden relative">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="h-9 w-9 text-muted-foreground"
            >
              <Menu className="size-5" />
            </Button>

            {isMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-transparent"
                  onClick={() => setIsMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-48 rounded-md bg-card border border-border shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-100">
                  <Link
                    to="/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-slate-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back to Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Dashboard Actions: Sign Out & Avatar */}
        {variant === 'dashboard' && (
          <>
            <Button
              type="button"
              variant="ghost"
              onClick={logout}
              className="text-sm font-medium text-foreground hover:text-muted-foreground cursor-pointer h-auto p-0 hover:bg-transparent shadow-none"
            >
              Sign Out
            </Button>
            <Separator orientation="vertical" className="h-4 bg-slate-300" />
            <Avatar className="size-8">
              <AvatarFallback className="bg-muted text-muted-foreground border border-border flex items-center justify-center">
                <User className="size-4" />
              </AvatarFallback>
            </Avatar>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
