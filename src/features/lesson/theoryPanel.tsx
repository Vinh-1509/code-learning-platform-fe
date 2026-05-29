import type { Block, ContentItem } from '@/lib/axios';
import { CodeEditor } from '@/components/ui/CodeEditor';
import { Separator } from '@/components/ui/separator';

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
      <h1 className="mt-2 text-3xl font-bold text-slate-900">
        {block.title || 'Theory'}
      </h1>
      {block.description && (
        <p className="mt-2 text-slate-500">{block.description}</p>
      )}

      <Separator className="my-6" />

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

                {/* Replaced hardcoded UI block with the shared component */}
                <CodeEditor language="cpp" code={item.data.code} />
              </section>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}
