import React from 'react';
import { TOKEN_COLORS, tokenize, type SyntaxToken } from '@/lib/syntax';

interface CodeLine {
  indent: number;
  parts: SyntaxToken[];
}

export interface CodeEditorProps {
  lines?: CodeLine[];
  code?: string;
  language?: string;
  children?: React.ReactNode;
}

export function CodeEditor({
  lines = [],
  code,
  language = 'cpp',
  children,
}: CodeEditorProps) {
  const renderRawCode = () => {
    if (!code) return null;
    const rawLines = code.split('\n');
    return rawLines.map((lineStr, idx) => {
      const tokens = tokenize(lineStr);
      return (
        <div
          key={idx}
          className="flex items-center gap-0 mb-1 leading-relaxed hover:bg-[#2d2d30] px-2 py-0.5 rounded transition-colors min-h-[24px]"
        >
          <div className="flex items-center gap-0 flex-nowrap">
            {tokens.map((token, tokenIdx) => (
              <span
                key={tokenIdx}
                style={{ color: TOKEN_COLORS[token.type] }}
                className="whitespace-pre shrink-0" // Kept code as a single line
              >
                {token.text}
              </span>
            ))}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="overflow-hidden rounded-xl border border-[#3e3e42] shadow-lg">
      {/* Window chrome: dots + language label */}
      <div className="flex h-8 items-center justify-between bg-[#121726] px-4">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
        </div>
        <span className="font-mono text-xs text-slate-500">{language}</span>
      </div>

      {/* Editor body: Allowed both X and Y auto-scrolling with a hidden scrollbar */}
      <div className="bg-[#1e1e1e] p-6 font-mono text-sm overflow-y-auto overflow-x-auto max-h-96 scrollbar-none">
        {children
          ? children
          : code
            ? renderRawCode()
            : lines.map((line, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-0 mb-1 leading-relaxed hover:bg-[#2d2d30] px-2 py-0.5 rounded transition-colors w-max min-w-full"
                >
                  {/* Indentation */}
                  {Array.from({ length: line.indent }).map((_, i) => (
                    <span key={`indent-${idx}-${i}`} className="w-4 shrink-0" />
                  ))}

                  {/* Line content */}
                  <div className="flex items-center gap-0 flex-nowrap">
                    {line.parts.map((part, partIdx) => (
                      <span
                        key={partIdx}
                        style={{ color: TOKEN_COLORS[part.type] }}
                        className="whitespace-pre shrink-0" // Code maintains line-breaks correctly
                      >
                        {part.text}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
      </div>
    </div>
  );
}
