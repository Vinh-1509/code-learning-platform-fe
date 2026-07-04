import { X, ChevronRight, ChevronLeft, SkipForward } from 'lucide-react';
import type { TooltipRenderProps } from 'react-joyride';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// Custom Joyride tooltip using Tailwind UI components
export default function TourTooltip({
  index,
  isLastStep,
  size,
  step,
  backProps,
  closeProps,
  primaryProps,
  skipProps,
  tooltipProps,
}: TooltipRenderProps) {
  const { buttons, title, content } = step;

  const showSkip = buttons.includes('skip') && !isLastStep;
  const showBack = buttons.includes('back') && index > 0;
  const showPrimary = buttons.includes('primary');

  return (
    <div
      {...tooltipProps}
      className={cn(
        'relative w-[min(340px,calc(100vw-2rem))] rounded-2xl border border-border bg-card shadow-2xl',
        'animate-in fade-in slide-in-from-bottom-2 duration-200'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-1">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary/80">
            Step {index + 1} of {size}
          </p>
          {title && (
            <h4 className="mt-1.5 text-base font-semibold leading-snug tracking-tight text-foreground">
              {title as string}
            </h4>
          )}
        </div>

        {/* Close button */}
        <button
          type="button"
          {...closeProps}
          className="-mr-1 -mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Body */}
      <div className="px-5 pb-5 pt-2 text-sm leading-relaxed text-muted-foreground">
        {content}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border/60 px-5 py-3">
        {/* Left: Skip */}
        <div>
          {showSkip && (
            <button
              type="button"
              {...skipProps}
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground/70 transition-colors hover:text-foreground cursor-pointer"
            >
              <SkipForward className="size-4" />
              Skip tour
            </button>
          )}
        </div>

        {/* Right: Back + Next/Finish */}
        <div className="flex items-center gap-2">
          {showBack && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              {...backProps}
              className="gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <ChevronLeft className="size-4" />
              Back
            </Button>
          )}

          {showPrimary && (
            <Button
              type="button"
              size="sm"
              {...primaryProps}
              className="gap-1 bg-primary text-primary-foreground shadow-md shadow-primary/25 hover:bg-primary/90 cursor-pointer"
            >
              {isLastStep ? 'Finish' : 'Next'}
              {!isLastStep && <ChevronRight className="size-4" />}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
