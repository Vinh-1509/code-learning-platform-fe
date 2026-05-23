import { Link, getRouteApi } from '@tanstack/react-router';
import { ChevronLeft } from 'lucide-react';
import { usePractice } from './usePractice';
import { LessonSidebar } from './lessonSidebar';
import { TheoryPane } from './theoryPanel';
import { useState } from 'react';
import type { Block } from '@/lib/axios';

const lessonRouteApi = getRouteApi('/lesson/$lessonId');

export function LessonPage() {
  const { lessonId } = lessonRouteApi.useParams();
  const { currentLesson } = usePractice({ lessonId });

  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(() => {
    if (!currentLesson?.blocks || currentLesson.blocks.length === 0)
      return null;
    const firstActiveBlock = currentLesson.blocks.find(
      (b: Block) => b.state === 'active'
    );
    return firstActiveBlock
      ? firstActiveBlock._id
      : currentLesson.blocks[0]._id;
  });

  const activeBlockId =
    selectedBlockId ||
    currentLesson?.blocks?.find((b: Block) => b.state === 'active')?._id ||
    currentLesson?.blocks?.[0]?._id ||
    null;

  const currentBlock = currentLesson?.blocks?.find(
    (b: Block) => b._id === activeBlockId
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
          selectedBlockId={activeBlockId} // 🌟 SỬA THÀNH activeBlockId ĐỂ SIDEBAR HIGHLIGHT ĐÚNG
          onSelectBlock={setSelectedBlockId} // Khi user click chọn item mới, state này thay đổi -> activeBlockId thay đổi theo
        />
        <TheoryPane block={currentBlock} />
      </div>
    </div>
  );
}
