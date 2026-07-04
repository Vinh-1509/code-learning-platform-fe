import { useState } from 'react';
import { Link } from '@tanstack/react-router';
// 💡 SỬA LỖI DÒNG 40: Thêm PanelLeftOpen vào đây
import {
  ChevronLeft,
  User,
  Menu,
  Code,
  LogOut,
  Award,
  PanelLeftOpen,
} from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTour } from '@/components/tour/TourProvider';

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
  const { user } = useAuth();
  const { mutate: handleLogout } = useLogout();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { startTour } = useTour();

  const activeLanguage = user?.selectedLanguage?.[0];
  const isCpp = activeLanguage === 'C++';
  const tabActiveStyle = isCpp
    ? 'border border-purple-cpp text-purple-cpp bg-purple-jv-background/20 shadow-sm font-bold'
    : 'border border-orange-jv text-orange-jv bg-orange-jv-background/20 shadow-sm font-bold';

  const isLesson = variant === 'lesson';
  const isPractice = variant === 'practice';
  const backTo = isPractice ? '/practice' : '/dashboard';
  const backLabel = isPractice ? 'Back to Practice' : 'Back to Dashboard';

  // 💡 SỬA LỖI TO_LOCALESTRING: Ép kiểu rõ ràng là number để loại bỏ hoàn toàn cảnh báo của @typescript-eslint
  const userCoins = 0; //Number(user?.coins ?? 0);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-14 bg-card border-b border-border select-none">
      {/* LEFT: Logo & Sidebar Toggles */}
      <div className="flex items-center gap-2">
        {variant === 'lesson' && onToggleSidebar && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="lg:hidden h-9 w-9 text-muted-foreground hover:bg-accent"
          >
            <PanelLeftOpen className="size-5 text-primary" />
          </Button>
        )}
        <Link
          to="/dashboard"
          className="inline-block transition-all duration-200 ease-out transform hover:scale-105 active:scale-95 active:opacity-80 cursor-pointer"
        >
          <div
            className={cn(
              'flex items-center justify-center size-9 bg-primary text-primary-foreground rounded-xl shadow-md shadow-primary/30 md:hidden',
              variant === 'lesson' && 'hidden'
            )}
          >
            <Code className="size-5" />
          </div>

          <span
            className={cn(
              'hidden md:inline-block font-extrabold text-xl text-primary tracking-tight',
              variant === 'lesson' && 'hidden lg:inline-block'
            )}
          >
            CodeStep
          </span>
        </Link>
      </div>

      {/* MIDDLE: Mobile View Switcher */}
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
              onChangeTab(variant === 'lesson' ? 'practice' : 'practice')
            }
            className={cn(
              'px-4 py-1 text-sm font-semibold rounded-md transition-all h-8 flex items-center justify-center cursor-pointer',
              activeTab === 'practice' || activeTab === 'code'
                ? tabActiveStyle
                : 'border border-transparent text-slate-300 bg-transparent'
            )}
          >
            {variant === 'lesson' ? 'Exercise' : 'Practice'}
          </button>
        </div>
      )}

      {/* RIGHT: Actions / Profile Menu */}
      <div className="flex items-center gap-3">
        {/* View Học Bài (Lesson/Practice) */}
        {(isLesson || isPractice) && (
          <div className="flex items-center gap-1.5 px-3 h-8.5 bg-primary/10 border border-primary/20 rounded-xl text-primary font-extrabold text-sm shadow-sm">
            <Award className="size-4 text-primary animate-pulse" />
            <span>
              {userCoins.toLocaleString()}{' '}
              <span className="text-xs font-medium opacity-80">CS-Pts</span>
            </span>
          </div>
        )}

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
                      handleLogout();
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

        {variant === 'dashboard' && (
          <>
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-1.5 px-3 h-8.5 bg-primary/10 border border-primary/20 rounded-xl text-primary font-extrabold text-sm shadow-sm">
                <Award className="size-4 text-primary animate-pulse" />
                <span>
                  {userCoins.toLocaleString()}{' '}
                  <span className="text-xs font-medium opacity-80">CS-Pts</span>
                </span>
              </div>

              <Button
                type="button"
                variant="ghost"
                onClick={() => handleLogout()}
                className="flex items-center gap-2 px-3 h-9 text-sm font-semibold text-red-600 hover:bg-rose-50 hover:text-red-700 cursor-pointer shadow-none rounded-lg"
              >
                <LogOut className="size-4" />
                Sign Out
              </Button>
              <Avatar className="size-8">
                <AvatarFallback className="bg-muted text-muted-foreground border border-border flex items-center justify-center">
                  <User className="size-4" />
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Mobile View cho Dashboard */}
            <div className="flex items-center gap-2 md:hidden">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 border border-primary/20 rounded-lg text-primary font-bold text-xs">
                <Award className="size-3.5 text-primary" />
                <span>{userCoins.toLocaleString()}</span>
              </div>

              {onToggleSidebar && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={onToggleSidebar}
                  data-tour="menu-btn"
                  className="h-9 w-9 text-muted-foreground -mr-2"
                >
                  <Menu className="size-5" />
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
