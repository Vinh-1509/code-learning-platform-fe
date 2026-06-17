import { ChevronLeft, User, Menu, Code } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { useAuth } from '@/features/auth/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface NavbarProps {
  variant?: 'dashboard' | 'lesson' | 'practice';
  onToggleSidebar?: () => void;
  activeTab?: 'theory' | 'practice';
  onChangeTab?: (tab: 'theory' | 'practice') => void;
}

/**
 * Navbar component renders the fixed global header navigation.
 * Displays brand name, lesson redirection triggers, and user profile/sign-out actions.
 * Styled with shadcn Avatar, Separator, and Button components.
 *
 * @param {NavbarProps} props - The component properties.
 * @param {'dashboard' | 'lesson'} [props.variant='dashboard'] - Active header layout ('dashboard' or 'lesson').
 * @param {Function} [props.onToggleSidebar] - Callback function to toggle the mobile sidebar drawer.
 * @param {'theory' | 'practice'} [props.activeTab] - Active tab state on lesson view.
 * @param {Function} [props.onChangeTab] - Callback function to change the active tab.
 * @returns {JSX.Element} The rendered Navbar component.
 */
const Navbar = ({
  variant = 'dashboard',
  onToggleSidebar,
  activeTab,
  onChangeTab,
}: NavbarProps) => {
  const { logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-14 bg-card border-b border-border select-none">
      {/* Left section */}
      <div className="flex items-center gap-2">
        {variant === 'dashboard' && onToggleSidebar && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="md:hidden -ml-2 h-9 w-9 text-muted-foreground hover:text-foreground"
          >
            <Menu className="size-5" />
          </Button>
        )}

        {variant === 'lesson' && onToggleSidebar && (
          <Button
            type="button"
            onClick={onToggleSidebar}
            className="lg:hidden flex items-center justify-center size-9 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow p-0 cursor-pointer"
          >
            <Code className="size-5" />
          </Button>
        )}

        <span
          className={cn(
            'text-xl font-black text-primary tracking-tight',
            variant === 'lesson' && 'hidden lg:inline'
          )}
        >
          CodeStep
        </span>
      </div>

      {/* Middle section: Mobile Switcher (Learn / Code) */}
      {variant === 'lesson' && activeTab && onChangeTab && (
        <div className="lg:hidden flex border border-slate-200 rounded-lg p-0.5 bg-white select-none">
          <button
            type="button"
            onClick={() => onChangeTab('theory')}
            className={cn(
              'px-4 py-1 text-sm font-semibold rounded-md transition-all duration-200 h-8 flex items-center justify-center cursor-pointer',
              activeTab === 'theory'
                ? 'border border-orange-400 text-orange-500 bg-white shadow-sm font-bold'
                : 'border border-transparent text-slate-300 bg-transparent'
            )}
          >
            Learn
          </button>
          <button
            type="button"
            onClick={() => onChangeTab('practice')}
            className={cn(
              'px-4 py-1 text-sm font-semibold rounded-md transition-all duration-200 h-8 flex items-center justify-center cursor-pointer',
              activeTab === 'practice'
                ? 'border border-orange-400 text-orange-500 bg-white shadow-sm font-bold'
                : 'border border-transparent text-slate-300 bg-transparent'
            )}
          >
            Code
          </button>
        </div>
      )}

      {/* Right section */}
      {variant === 'lesson' && (
        <>
          {/* Desktop Back button */}
          <Link to="/dashboard" className="hidden lg:block">
            <Button
              type="button"
              variant="secondary"
              className="flex items-center gap-1 rounded-lg px-4 h-9 text-sm font-semibold hover:bg-accent transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>

          {/* Mobile hamburger menu */}
          <div className="lg:hidden relative">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
            >
              <Menu className="size-5" />
            </Button>

            {isMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-transparent"
                  onClick={() => setIsMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-48 rounded-md bg-white border border-border shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-100">
                  <Link
                    to="/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-slate-50 transition-colors"
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
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {variant === 'practice' && (
        <Link to="/practice">
          <Button
            type="button"
            variant="secondary"
            className="flex items-center gap-1 bg-trueaccent text-primary rounded-lg px-4 h-9 text-sm font-semibold hover:bg-accent transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Practice
          </Button>
        </Link>
      )}

      {variant === 'dashboard' && (
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={logout}
            className="text-sm font-medium text-foreground hover:text-muted-foreground transition-colors cursor-pointer h-auto p-0 hover:bg-transparent shadow-none"
          >
            Sign Out
          </Button>

          <Separator orientation="vertical" className="h-4 bg-slate-300" />

          <Avatar className="size-8">
            <AvatarImage src="" alt="User profile" />
            <AvatarFallback className="bg-muted text-muted-foreground border border-border flex items-center justify-center">
              <User className="size-4" />
            </AvatarFallback>
          </Avatar>
        </div>
      )}
    </header>
  );
};

export default Navbar;
