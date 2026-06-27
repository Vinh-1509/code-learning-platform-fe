import type { Block, ContentItem } from '@/types/api/learning.types';
import { CodeEditor } from '@/components/ui/CodeEditor';
import { Separator } from '@/components/ui/separator';

interface TheoryPaneProps {
  block: Block | undefined;
}

/**
 * TheoryPanel component renders the sorted content blocks (theory explanations and code examples)
 * associated with a single lesson block.
 *
 * @param {TheoryPaneProps} props - The component properties.
 * @param {Block} [props.block] - The block object containing content array to render.
 * @returns {JSX.Element | null} The rendered TheoryPanel component, or null if no block data.
 */
export function TheoryPanel({ block }: TheoryPaneProps) {
  if (!block) {
    return null;
  }

  const sortedContent = [...block.content].sort(
    (a, b) => a.data.order - b.data.order
  );

  return (
    <div className="flex-1 bg-card p-4 md:p-6 min-w-0 ">
      <h1 className="mt-2 text-2xl md:text-3xl font-bold text-foreground">
        {block.title || 'Theory'}
      </h1>
      {block.description && (
        <p className="mt-2 text-muted-foreground font-medium md:font-normal">
          {block.description}
        </p>
      )}

      <Separator className="my-6" />

      <div className="space-y-8">
        {sortedContent.map((item: ContentItem, index: number) => {
          if (item.type === 'theory') {
            return (
              <section key={index} className="space-y-3">
                <h2 className="text-sm font-bold text-foreground">
                  {index + 1}. What is it?
                </h2>

                <div className="rounded-lg border-l-4 border-primary bg-primary-second p-4 text-sm text-primary font-medium md:font-normal">
                  {item.data.text}
                </div>
              </section>
            );
          }

          if (item.type === 'code') {
            return (
              <section key={index} className="space-y-3">
                <h2 className="text-sm font-bold text-foreground">
                  {index + 1}. Example
                </h2>

                {item.data.explanation && (
                  <p className="text-sm leading-6 text-muted-foreground font-medium md:font-normal">
                    {item.data.explanation}
                  </p>
                )}

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
