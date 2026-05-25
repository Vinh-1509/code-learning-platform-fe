import { getRouteApi } from '@tanstack/react-router';
import { usePractice } from './usePractice';
import { LessonSidebar } from './lessonSidebar';
import { TheoryPane } from './theoryPanel';
import { useState } from 'react';
import type { Block } from '@/lib/axios';
import { PracticePane } from './practicePanel';
import type { DraggableBlock } from './types';
import Navbar from '@/components/sidebar/Navbar';

const lessonRouteApi = getRouteApi('/lesson/$lessonId');

export function LessonPage() {
  const { lessonId } = lessonRouteApi.useParams();
  const { currentLesson } = usePractice({ lessonId });

  const dummyBlocks: DraggableBlock[] = [
    { id: '1', code: 'for i in range(3):', indent: 0 },
    { id: '2', code: 'print(i)', indent: 1 },
    { id: '3', code: '# → 0, 1, 2', indent: 1 },
  ];
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  const activeBlockId =
    selectedBlockId ??
    currentLesson?.blocks.find((b: Block) => b.state === 'active')?._id ??
    currentLesson?.blocks[0]?._id ??
    null;

  const currentBlock =
    currentLesson?.blocks.find((b: Block) => b._id === activeBlockId) ??
    undefined;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      <Navbar variant="lesson" />

      <div className="flex flex-1 pt-14 overflow-hidden">
        <LessonSidebar
          blocks={currentLesson?.blocks || []}
          lessonTitle={currentLesson?.title}
          selectedBlockId={activeBlockId}
          onSelectBlock={setSelectedBlockId}
        />

        <div className="flex-1  overflow-y-auto">
          <TheoryPane block={currentBlock} />
        </div>

        <div className="flex-1  overflow-y-auto">
          <PracticePane
            availableBlocks={dummyBlocks}
            droppedBlocks={[null, null, null]}
            overSlot={null}
            showResult={null}
            submitted={false}
            isSubmitting={false}
            onDragStart={() => {}}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={() => {}}
            onDrop={() => {}}
            onRemove={() => {}}
            onSubmit={() => {}}
            onReset={() => {}}
          />
        </div>
      </div>
    </div>
  );
}
