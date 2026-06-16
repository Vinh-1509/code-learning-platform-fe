import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SubmitBarProps {
  allFilled: boolean;
  isSubmitting: boolean;
  canResubmit?: boolean;
  onSubmit: () => void;
}

export function SubmitBar({
  allFilled,
  isSubmitting,
  canResubmit = true,
  onSubmit,
}: SubmitBarProps) {
  const isDisabled = !allFilled || isSubmitting || !canResubmit;

  return (
    <div className="pt-6">
      <p className="text-[10px] text-slate-400 text-center mb-2 font-medium">
        {!allFilled
          ? 'Fill in all blanks to enable submit.'
          : !canResubmit
            ? 'Modify your answer to submit again.'
            : ''}
      </p>
      <Button
        onClick={onSubmit}
        disabled={isDisabled}
        className={cn(
          'w-full font-bold h-10 text-xs text-white rounded-xl transition-all uppercase tracking-wider',
          !isDisabled
            ? 'bg-blue-600 hover:bg-blue-700 shadow-md cursor-pointer'
            : 'bg-blue-200 text-blue-400/80 cursor-not-allowed shadow-none'
        )}
      >
        {isSubmitting ? 'Verifying...' : 'Submit Answer →'}
      </Button>
    </div>
  );
}
