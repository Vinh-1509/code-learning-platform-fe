import type { Block, ContentItem } from '@/lib/axios';

interface TheoryPaneProps {
  block: Block | undefined;
}

export function TheoryPane({ block }: TheoryPaneProps) {
  if (!block) {
    return null;
  }

  const sortedContent = [...block.content].sort(
    (a, b) => a.data.order - b.data.order
  );

  return (
    <div className="flex-1 bg-white p-6 min-w-0 border-r border-slate-200">
      <h1 className="mt-2 text-3xl font-bold text-slate-900">hello</h1>

      <div className="my-6 h-px bg-slate-200" />

      <div className="space-y-8">
        {sortedContent.map((item: ContentItem, index: number) => {
          if (item.type === 'theory') {
            return (
              <section key={index} className="space-y-3">
                <h2 className="text-sm font-bold text-slate-900">
                  {index + 1}. What is it?
                </h2>

                <div className="rounded-lg border-l-4 border-blue-600 bg-blue-50 p-4 text-sm text-blue-700">
                  {item.data.text}
                </div>
              </section>
            );
          }

          if (item.type === 'code') {
            return (
              <section key={index} className="space-y-3">
                <h2 className="text-sm font-bold text-slate-900">
                  {index + 1}. Example
                </h2>

                {item.data.explanation && (
                  <p className="text-sm leading-6 text-slate-600">
                    {item.data.explanation}
                  </p>
                )}

                <div className="overflow-hidden rounded-xl bg-[#1b2130]">
                  <div className="flex h-8 items-center justify-between bg-[#121726] px-4">
                    <div className="flex gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                      <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                    </div>

                    <span className="font-mono text-xs text-slate-500">
                      cpp
                    </span>
                  </div>

                  <pre className="overflow-x-auto p-4 font-mono text-sm text-slate-100">
                    <code>{item.data.code}</code>
                  </pre>
                </div>
              </section>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}
