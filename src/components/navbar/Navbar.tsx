import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ChevronLeft, User, Menu, Code } from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavbarProps {
  variant?: 'dashboard' | 'lesson' | 'practice';
  onToggleSidebar?: () => void;
  activeTab?: 'theory' | 'practice' | 'description' | 'code';
  onChangeTab?: (tab: 'theory' | 'practice' | 'description' | 'code') => void;
}

const Navbar = ({
  variant = 'dashboard',
  onToggleSidebar,
  activeTab,
  onChangeTab,
}: NavbarProps) => {
  const { logout, user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const activeLanguage = user?.selectedLanguage?.[0];
  const isCpp = activeLanguage === 'C++';
  const tabActiveStyle = isCpp
    ? 'border border-purple-cpp text-purple-cpp bg-purple-jv-background/20 shadow-sm font-bold'
    : 'border border-orange-jv text-orange-jv bg-orange-jv-background/20 shadow-sm font-bold';

  // Quick config for back buttons to reduce repetitive JSX
  const isLesson = variant === 'lesson';
  const isPractice = variant === 'practice';
  const backTo = isPractice ? '/practice' : '/dashboard';
  const backLabel = isPractice ? 'Back to Practice' : 'Back to Dashboard';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-14 bg-card border-b border-border select-none">
      {/* LEFT: Logo & Sidebar Toggles */}
      <div className="flex items-center gap-2">
        {/* Lesson Sidebar Toggle */}
        {variant === 'lesson' && onToggleSidebar && (
          <Button
            type="button"
            onClick={onToggleSidebar}
            className="lg:hidden flex items-center justify-center size-9 bg-primary text-primary-foreground rounded-xl shadow-md shadow-primary/30 p-0"
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
          <div className="flex items-center justify-center size-9 bg-primary text-primary-foreground rounded-xl shadow-md shadow-primary/30">
            <Code className="size-5" />
          </div>
        </Link>
      </div>

      {/* MIDDLE: Mobile View Switcher (Learn / Code or Description / Code) */}
      {(isLesson || isPractice) && activeTab && onChangeTab && (
        <div className="lg:hidden flex border border-border rounded-lg p-0.5 bg-card select-none">
          <button
            type="button"
            onClick={() =>
              onChangeTab(variant === 'lesson' ? 'theory' : 'description')
            }
            className={cn(
              'px-4 py-1 text-sm font-semibold rounded-md transition-all h-8 flex items-center justify-center cursor-pointer',
              activeTab === 'theory' || activeTab === 'description'
                ? tabActiveStyle
                : 'border border-transparent text-slate-300 bg-transparent'
            )}
          >
            {variant === 'lesson' ? 'Learn' : 'Description'}
          </button>
          <button
            type="button"
            onClick={() =>
              onChangeTab(variant === 'lesson' ? 'practice' : 'code')
            }
            className={cn(
              'px-4 py-1 text-sm font-semibold rounded-md transition-all h-8 flex items-center justify-center cursor-pointer',
              activeTab === 'practice' || activeTab === 'code'
                ? tabActiveStyle
                : 'border border-transparent text-slate-300 bg-transparent'
            )}
          >
            Code
          </button>
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

        {/* Mobile Dropdown Menu for Lesson & Practice View */}
        {(isLesson || isPractice) && (
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
                    to={backTo}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-slate-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    {backLabel}
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
            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              <Avatar className="size-8">
                <AvatarFallback className="bg-muted text-muted-foreground border border-border flex items-center justify-center">
                  <User className="size-4" />
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Mobile Actions: Sidebar Toggle */}
            {onToggleSidebar && (
              <div className="md:hidden">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={onToggleSidebar}
                  className="h-9 w-9 text-muted-foreground -mr-2"
                >
                  <Menu className="size-5" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
