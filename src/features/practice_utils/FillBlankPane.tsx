import type { ExplainAnswerResponse } from '@/lib/axios';
import { CodeEditor } from '@/components/ui/CodeEditor';

import type { BlankLine } from './types/practiceTypes';
import type { ExplanationStatus } from './types/asyncTypes';

import { ResultBanner } from './shared/ResultBanner';
import { HintStrip } from './shared/HintStrip';
import { SubmitBar } from './shared/SubmitBar';

import { BlankInput } from './components/fill_blank/BlankInput';
import { CodeText } from './components/fill_blank/CodeText';

interface FillBlankPaneProps {
  description: string;
  lines: BlankLine[];
  hints: string[];
  isHintOpen: boolean;
  userAnswers: Record<string, string>;
  showResult: 'correct' | 'wrong' | null;
  isSubmitting: boolean;
  canResubmit: boolean;
  explanation?: ExplainAnswerResponse | null;
  explanationStatus: ExplanationStatus;
  showDescription?: boolean;
  onAnswerChange: (partId: string, value: string) => void;
  onSubmit: () => void;
  onToggleHint: () => void;
  onRequestHint: () => void;
}

export function FillBlankPane({
  description,
  lines,
  userAnswers,
  hints,
  isHintOpen,
  showResult,
  isSubmitting,
  canResubmit,
  explanation,
  explanationStatus,
  showDescription = true,
  onAnswerChange,
  onSubmit,
  onToggleHint,
  onRequestHint,
}: FillBlankPaneProps) {
  const allFilled = lines.every((line) =>
    line.parts.every((part) => !part.isBlank || Boolean(userAnswers[part.id]))
  );

  return (
    <div className="min-h-full bg-card p-6 flex flex-col justify-between">
      <div>
        {/* Task Description */}
        {showDescription && description && (
          <div className="rounded-xl p-4 bg-primary-second/80 border border-primary-second-border/70 text-sm text-primary mb-5">
            <p className="font-bold text-[13px]">
              {description || 'Task: Fill in the missing code snippets'}
            </p>

            <p className="text-xs text-primary/90 mt-0.5">
              Read the code carefully and fill in the blank fields to complete
              the program.
            </p>
          </div>
        )}
        <ResultBanner
          showResult={showResult}
          explanation={explanation}
          explanationStatus={explanationStatus}
        />

        <p className="text-[11px] font-bold text-muted-foreground mb-3 tracking-wider uppercase">
          Code Editor
        </p>

        {/* Code Editor */}
        <CodeEditor language="cpp">
          {lines.map((line) => (
            <div
              key={line.id}
              className="flex items-center gap-0 mb-1 leading-relaxed hover:bg-[#2d2d30] px-2 py-0.5 rounded transition-colors w-max min-w-full"
            >
              {/* Indentation */}
              {Array.from({ length: line.indent }).map((_, index) => (
                <span
                  key={`indent-${line.id}-${index}`}
                  className="w-4 shrink-0"
                />
              ))}

              {/* Line Content */}
              <div className="flex items-center gap-0 flex-nowrap">
                {line.parts.map((part) => {
                  const answer = userAnswers[part.id] ?? '';

                  if (part.isBlank) {
                    return (
                      <BlankInput
                        key={part.id}
                        partId={part.id}
                        answer={answer}
                        onAnswerChange={onAnswerChange}
                      />
                    );
                  }

                  return (
                    <span key={part.id} className="whitespace-pre shrink-0">
                      <CodeText text={part.text} />
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </CodeEditor>

        <HintStrip
          onToggleHint={onToggleHint}
          onRequestHint={onRequestHint}
          hints={hints}
          isOpen={isHintOpen}
        />
      </div>

      <SubmitBar
        allFilled={allFilled}
        isSubmitting={isSubmitting}
        canResubmit={canResubmit}
        onSubmit={onSubmit}
      />
    </div>
  );
}
