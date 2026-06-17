import type { Block } from '@/lib/axios';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface LessonSidebarProps {
  blocks: Block[];
  lessonTitle?: string;
  selectedBlockId: string | null;
  onSelectBlock: (id: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

function BlockIcon({
  isLocked,
  status,
  isFeynmanPassed,
}: {
  isLocked: boolean;
  status: Block['status'];
  isFeynmanPassed: boolean;
}) {
  if (isLocked) {
    return (
      <div className="size-5 rounded-full flex items-center justify-center bg-dark-gray text-muted-foreground text-[10px] shrink-0">
        🔒
      </div>
    );
  }
  if (status === 'completed' && isFeynmanPassed) {
    return (
      <div className="size-5 rounded-full flex items-center justify-center bg-bluelight text-primary-foreground text-[10px] font-bold shrink-0">
        ✓
      </div>
    );
  }
  return (
    <div className="size-5 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-[10px] font-bold shrink-0">
      ●
    </div>
  );
}

/**
 * LessonSidebar component renders the sidebar navigation for blocks within a lesson.
 * Supports sliding drawer on mobile/tablet viewports and standard sidebar on desktop.
 *
 * @param {LessonSidebarProps} props - The component properties.
 * @param {Block[]} props.blocks - The list of blocks in the lesson.
 * @param {string} [props.lessonTitle] - The title of the lesson.
 * @param {string | null} props.selectedBlockId - The currently selected block ID.
 * @param {Function} props.onSelectBlock - Callback function when a block is clicked/selected.
 * @param {boolean} [props.isOpen=false] - Flag indicating if the drawer is open on mobile.
 * @param {Function} [props.onClose] - Callback function to close the mobile drawer.
 * @returns {JSX.Element} The rendered LessonSidebar component.
 */
export function LessonSidebar({
  blocks,
  lessonTitle,
  selectedBlockId,
  onSelectBlock,
  isOpen = false,
  onClose,
}: LessonSidebarProps) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden animate-in fade-in duration-200"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          'fixed top-14 left-0 bottom-0 w-64 flex flex-col bg-background border-r overflow-y-auto z-40 transition-transform duration-300 lg:translate-x-0 lg:static lg:h-[calc(100vh-56px)]',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="px-4 pt-5 pb-2">
          <p className="text-[10px] font-bold mb-2 text-muted-foreground tracking-wider">
            LESSON BLOCKS
          </p>
          <Separator />
        </div>
        <div className="flex flex-col">
          {blocks.map((block, index) => {
            const prevBlock = index > 0 ? blocks[index - 1] : null;

            // Enforce lock from the frontend until the previous block has fully passed Feynman
            const isLocked =
              block.status === 'locked' ||
              (prevBlock !== null && !prevBlock.isFeynmanPassed);

            const isSelected = block._id === selectedBlockId;

            const blockTypeLabel = lessonTitle;

            return (
              <div
                key={block._id}
                onClick={() => {
                  if (!isLocked) {
                    onSelectBlock(block._id);
                    onClose?.();
                  }
                }}
                className={cn(
                  'relative flex items-center gap-3 px-4 py-3 min-h-18 transition-colors select-none',
                  isLocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
                  isSelected
                    ? 'bg-blue-50/50'
                    : !isLocked
                      ? 'hover:bg-slate-100'
                      : ''
                )}
              >
                {isSelected && (
                  <div className="absolute left-0 top-0 w-0.75 h-full bg-primary" />
                )}

                <BlockIcon
                  isLocked={isLocked}
                  status={block.status}
                  isFeynmanPassed={block.isFeynmanPassed}
                />

                <div className="flex flex-col min-w-0 flex-1 justify-center gap-0.5">
                  <span
                    className={cn(
                      'text-[10px] font-bold uppercase tracking-wider',
                      isSelected
                        ? 'text-primary'
                        : 'text-primary-second-foreground'
                    )}
                  >
                    Block {index + 1}
                  </span>
                  <span className="text-sm font-medium text-primary-foreground truncate leading-tight">
                    {block.title || blockTypeLabel}
                  </span>
                  {block.description && (
                    <span className="text-xs text-muted-foreground truncate leading-tight">
                      {block.description}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </aside>
    </>
  );
}
