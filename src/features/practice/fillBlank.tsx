import { cn } from '@/lib/utils';
import type { BlankLine } from './types';
import { ResultBanner } from './shared/ResultBanner';
import { HintStrip } from './shared/HintStrip';
import { SubmitBar } from './shared/SubmitBar';
import { CodeEditor } from '@/components/ui/codeEditor';
import { TOKEN_COLORS, tokenize } from '@/lib/syntax';

interface FillBlankPaneProps {
  lines: BlankLine[];
  userAnswers: Record<string, string>;
  showResult: 'correct' | 'wrong' | null;
  submitted: boolean;
  isSubmitting: boolean;
  onAnswerChange: (partId: string, value: string) => void;
  onSubmit: () => void;
  onReset: () => void;
  onShowHint?: () => void;
}

export function FillBlankPane({
  lines,
  userAnswers,
  showResult,
  submitted,
  isSubmitting,
  onAnswerChange,
  onSubmit,
  onReset,
  onShowHint = () => {},
}: FillBlankPaneProps) {
  const allFilled = lines.every((line) =>
    line.parts.every((part) => !part.isBlank || userAnswers[part.id])
  );

  return (
    <div className="min-h-full bg-white p-6 flex flex-col justify-between">
      <div>
        {/* Task description */}
        <div className="rounded-xl p-4 bg-blue-50/80 border border-blue-100/70 text-sm text-blue-600 mb-5">
          <p className="font-bold text-[13px]">
            Task: Fill in the missing code snippets
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
        />

        <p className="text-[11px] font-bold text-slate-400 mb-3 tracking-wider uppercase">
          Code Editor
        </p>

        {/* Code Editor Container */}
        <CodeEditor language="cpp">
          {lines.map((line) => (
            <div
              key={line.id}
              className="flex items-center gap-0 mb-1 leading-relaxed hover:bg-[#2d2d30] px-2 py-0.5 rounded transition-colors w-max min-w-full"
            >
              {/* Indentation */}
              {Array.from({ length: line.indent }).map((_, i) => (
                <span key={`indent-${line.id}-${i}`} className="w-4 shrink-0" />
              ))}

              {/* Line content: flex-nowrap to allow clean scroll left-to-right */}
              <div className="flex items-center gap-0 flex-nowrap">
                {line.parts.map((part) => {
                  const answer = userAnswers[part.id] ?? '';

                  if (part.isBlank) {
                    return (
                      <input
                        key={part.id}
                        type="text"
                        value={answer}
                        onChange={(e) =>
                          onAnswerChange(part.id, e.target.value)
                        }
                        placeholder={`[${part.id}]`}
                        disabled={submitted}
                        className={cn(
                          'px-2 py-0.5 rounded border font-mono text-sm min-w-[60px] text-center transition-all focus:outline-none focus:ring-1 mx-0.5 shrink-0',
                          answer
                            ? 'bg-[#264F78] border-[#0E639C] text-[#CE9178] focus:ring-[#007ACC]'
                            : 'bg-[#2d2d30] border-[#3e3e42] text-[#858585] focus:ring-[#007ACC]',
                          submitted
                            ? 'opacity-60 cursor-not-allowed'
                            : 'cursor-text'
                        )}
                      />
                    );
                  }

                  return (
                    <span key={part.id} className="whitespace-pre shrink-0">
                      {tokenize(part.text).map((token, idx) => (
                        <span
                          key={idx}
                          style={{ color: TOKEN_COLORS[token.type] }}
                          className="whitespace-pre"
                        >
                          {token.text}
                        </span>
                      ))}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </CodeEditor>

        <HintStrip onShowHint={onShowHint} />
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
