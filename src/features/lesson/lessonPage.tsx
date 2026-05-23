import { Link, getRouteApi } from '@tanstack/react-router';
import { ChevronLeft } from 'lucide-react';
import { usePractice } from './usePractice';
import { LessonSidebar } from './lessonSidebar';
import { TheoryPane } from './theoryPanel';
// import { PracticePane } from './practicePanel';
import { useState } from 'react';
import type { Block } from '@/lib/axios';
const lessonRouteApi = getRouteApi('/lesson/$lessonId');

export function LessonPage() {
  const { lessonId } = lessonRouteApi.useParams();

  const { currentLesson } = usePractice({ lessonId });

  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  if (currentLesson?.blocks && currentLesson.blocks.length > 0) {
    const firstActiveBlock = currentLesson.blocks.find(
      (b: Block) => b.state === 'active'
    );
    if (firstActiveBlock) {
      setSelectedBlockId(firstActiveBlock._id);
    } else {
      setSelectedBlockId(currentLesson.blocks[0]._id);
    }
  }
  const currentBlock = currentLesson?.blocks?.find(
    (b: Block) => b._id === selectedBlockId
  );
  return (
    <div className="flex flex-col h-screen bg-white antialiased overflow-hidden">
      <header className="flex items-center justify-between px-6 h-14 bg-white border-b border-slate-200 ">
        <span className="text-xl font-black text-blue-600 tracking-tight">
          CodeStep
        </span>
        <Link to="/dashboard">
          <button className="flex items-center gap-1 rounded-lg px-4 h-9 text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to Dashboard
          </button>
        </Link>
      </header>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <LessonSidebar
          blocks={currentLesson?.blocks || []}
          lessonTitle={currentLesson?.title}
          selectedBlockId={selectedBlockId}
          onSelectBlock={setSelectedBlockId}
        />
        <TheoryPane block={currentBlock} />
        {/* <PracticePane
          availableBlocks={availableBlocks}
          droppedBlocks={droppedBlocks}
          overSlot={overSlot}
          showResult={showResult}
          submitted={submitted}
          isSubmitting={isSubmitting}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragLeave={() => setOverSlot(null)}
          onDrop={handleDrop}
          onRemove={handleRemove}
          onSubmit={handleSubmitAnswer}
          onReset={handleReset}
        /> */}
      </div>
    </div>
  );
}
