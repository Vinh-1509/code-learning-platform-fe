import { X, ChevronRight, ChevronLeft, SkipForward } from 'lucide-react';
import type { TooltipRenderProps } from 'react-joyride';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

/**
 * TourTooltip is a custom tooltip component for react-joyride that replaces
 * the default tooltip with an app-native Tailwind-styled card.
 *
 * Features:
 * - Progress bar at the top showing how far along the tour is
 * - Step counter ("Step 1 of 4")
 * - Close (X) button in the top-right corner
 * - Skip / Back / Next / Finish buttons using the app's Button component
 * - animate-in entrance animation
 */
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
      {/* ── Header row ── */}
      <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-1">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-widest text-primary">
            Step {index + 1} of {size}
          </p>
          {title && (
            <h4 className="mt-1 text-base font-extrabold leading-snug tracking-tight text-foreground">
              {title as string}
            </h4>
          )}
        </div>

        {/* Close button */}
        <button
          type="button"
          {...closeProps}
          className="-mr-1 -mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* ── Content ── */}
      <div className="px-5 pb-4 pt-1.5 text-[0.8125rem] leading-relaxed text-muted-foreground font-medium">
        {content}
      </div>

      {/* ── Footer buttons ── */}
      <div className="flex items-center justify-between border-t border-border px-5 py-3">
        {/* Left: Skip */}
        <div>
          {showSkip && (
            <button
              type="button"
              {...skipProps}
              className="flex items-center gap-1 text-xs font-semibold text-muted-foreground/70 transition-colors hover:text-foreground cursor-pointer"
            >
              <SkipForward className="size-3.5" />
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
              <ChevronLeft className="size-3.5" />
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
              {!isLastStep && <ChevronRight className="size-3.5" />}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
