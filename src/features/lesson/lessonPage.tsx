import { Link, getRouteApi } from '@tanstack/react-router';
import { ChevronLeft } from 'lucide-react';
import { usePractice } from './usePractice';
import { LessonSidebar } from './lessonSidebar';
import { TheoryPane } from './theoryPanel';
import { PracticePane } from './practicePanel';

const lessonRouteApi = getRouteApi('/lesson');

export function LessonPage() {
  const { lessonId } = lessonRouteApi.useSearch();

  const {
    sidebarLessons,
    availableBlocks,
    isLoading,
    isSubmitting,
    droppedBlocks,
    overSlot,
    submitted,
    showResult,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleRemove,
    handleSubmitAnswer,
    handleReset,
    setOverSlot,
  } = usePractice({ lessonId });

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center text-slate-400 text-xs">
        LOADING LESSON...
      </div>
    );

  return (
    <div className="flex flex-col h-screen bg-white antialiased overflow-hidden">
      <header className="flex items-center justify-between px-6 h-14 bg-white border-b border-slate-200 flex-shrink-0">
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
        <LessonSidebar blocks={sidebarLessons} />
        <TheoryPane />
        <PracticePane
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
        />
      </div>
    </div>
  );
}
