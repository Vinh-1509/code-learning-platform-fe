import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SubmitBarProps {
  allFilled: boolean;
  submitted: boolean;
  isSubmitting: boolean;
  onSubmit: () => void;
}

export function SubmitBar({
  allFilled,
  submitted,
  isSubmitting,
  onSubmit,
}: SubmitBarProps) {
  return (
    <div className="pt-6">
      <p className="text-[10px] text-slate-400 text-center mb-2 font-medium">
        {!allFilled && 'Fill in all blanks to enable submit.'}
      </p>
      <Button
        onClick={onSubmit}
        disabled={!allFilled || submitted || isSubmitting}
        className={cn(
          'w-full font-bold h-10 text-xs text-white rounded-xl transition-all uppercase tracking-wider',
          allFilled && !submitted && !isSubmitting
            ? 'bg-blue-600 hover:bg-blue-700 shadow-md cursor-pointer'
            : 'bg-blue-200 text-blue-400/80 cursor-not-allowed shadow-none'
        )}
      >
        {isSubmitting ? 'Verifying...' : 'Submit Answer →'}
      </Button>
    </div>
  );
}
