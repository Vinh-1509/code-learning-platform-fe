interface NavbarProps {
  variant?: 'dashboard' | 'lesson';
}
import { ChevronLeft } from 'lucide-react';
import { Link } from '@tanstack/react-router';
const Navbar = ({ variant = 'dashboard' }: NavbarProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-14 bg-white border-b border-slate-200">
      <span className="text-xl font-black text-blue-600 tracking-tight">
        CodeStep
      </span>

      {variant === 'lesson' && (
        <Link to="/dashboard">
          <button className="flex items-center gap-1 rounded-lg px-4 h-9 text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </Link>
      )}
    </header>
  );
};

export default Navbar;
