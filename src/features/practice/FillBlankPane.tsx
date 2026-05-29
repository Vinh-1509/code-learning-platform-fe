import type { ExplainAnswerResponse } from '@/lib/axios';
import { CodeEditor } from '@/components/ui/codeEditor';

import type { BlankLine } from './types/practice.types';
import type { ExplanationStatus } from './types/async.types';

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
  submitted: boolean;
  isSubmitting: boolean;
  explanation?: ExplainAnswerResponse | null;
  explanationStatus: ExplanationStatus;
  onAnswerChange: (partId: string, value: string) => void;
  onSubmit: () => void;
  onReset: () => void;
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
  submitted,
  isSubmitting,
  explanation,
  explanationStatus,
  onAnswerChange,
  onSubmit,
  onReset,
  onToggleHint,
  onRequestHint,
}: FillBlankPaneProps) {
  const allFilled = lines.every((line) =>
    line.parts.every((part) => !part.isBlank || Boolean(userAnswers[part.id]))
  );

  return (
    <div className="min-h-full bg-white p-6 flex flex-col justify-between">
      <div>
        {/* Task Description */}
        <div className="rounded-xl p-4 bg-blue-50/80 border border-blue-100/70 text-sm text-blue-600 mb-5">
          <p className="font-bold text-[13px]">
            {description || 'Task: Fill in the missing code snippets'}
          </p>

          <p className="text-xs text-blue-500/90 mt-0.5">
            Read the code carefully and fill in the blank fields to complete the
            program.
          </p>
        </div>

        <ResultBanner
          showResult={showResult}
          submitted={submitted}
          onReset={onReset}
          explanation={explanation}
          explanationStatus={explanationStatus}
        />

        <p className="text-[11px] font-bold text-slate-400 mb-3 tracking-wider uppercase">
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
                        submitted={submitted}
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
        submitted={submitted}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
      />
    </div>
  );
}
