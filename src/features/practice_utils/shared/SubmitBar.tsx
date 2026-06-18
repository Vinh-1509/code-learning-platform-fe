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
      <p className="text-[10px] text-muted-foreground text-center mb-2 font-medium">
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
            ? 'bg-primary hover:bg-primary/90 shadow-md cursor-pointer'
            : 'bg-primary-second text-primary-second-foreground/40 cursor-not-allowed shadow-none'
        )}
      >
        {isSubmitting ? 'Verifying...' : 'Submit Answer →'}
      </Button>
    </div>
  );
}
