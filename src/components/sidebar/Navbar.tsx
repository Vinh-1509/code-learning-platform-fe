import { ChevronLeft, User } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { useAuth } from '@/features/auth/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

interface NavbarProps {
  variant?: 'dashboard' | 'lesson';
}

const Navbar = ({ variant = 'dashboard' }: NavbarProps) => {
  const { logout } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-14 bg-card border-b border-border select-none">
      <span className="text-xl font-black text-primary tracking-tight">
        CodeStep
      </span>

      {variant === 'lesson' && (
        <Link to="/dashboard">
          <button
            type="button"
            className="flex items-center gap-1 rounded-lg px-4 h-9 text-sm font-semibold bg-muted text-foreground hover:bg-accent transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </Link>
      )}

      {variant === 'dashboard' && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={logout}
            className="text-sm font-medium text-foreground hover:text-muted-foreground transition-colors cursor-pointer"
          >
            Sign Out
          </button>

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
