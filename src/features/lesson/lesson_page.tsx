import { Link } from '@tanstack/react-router';
import { ChevronLeft } from 'lucide-react';
import { usePractice } from './usePractice';

import { LessonSidebar } from './components/lesson_sidebar';
import { TheoryPane } from './components/theory_panel';
import { PracticePane } from './components/practice_panel'; // Đã đồng bộ chính xác tên file của bạn

export function LessonPage() {
  const {
    sidebarLessons,
    availableBlocks,
    isLoading,
    isSubmitting,
    droppedBlocks,
    draggingId,
    draggingFromSlot,
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
  } = usePractice();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 font-medium text-slate-400 text-xs tracking-widest">
        LOADING LESSON...
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 antialiased selection:bg-blue-100">
      {/* ── Top Nav ── */}
      <header className="flex items-center justify-between px-6 h-14 bg-white border-b border-slate-200 z-10 flex-shrink-0">
        <span className="text-[22px] font-extrabold tracking-tight text-blue-600">
          CodeStep
        </span>
        <Link to="/dashboard">
          <button className="flex items-center gap-1 rounded-lg px-4 h-9 text-[14px] font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to Dashboard
          </button>
        </Link>
      </header>

      {/* ── Body Layout 3 Cột truyền data dynamic từ Hook ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden layout-body">
        <LessonSidebar blocks={sidebarLessons} />

        <TheoryPane />

        <PracticePane
          availableBlocks={availableBlocks}
          droppedBlocks={droppedBlocks}
          draggingId={draggingId}
          draggingFromSlot={draggingFromSlot}
          overSlot={overSlot}
          showResult={showResult}
          submitted={submitted}
          isSubmitting={isSubmitting}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragLeave={() => setOverSlot(null)}
          onDrop={handleDrop}
          onRemove={handleRemove}
          onSubmit={() => {
            void handleSubmitAnswer();
          }}
          onReset={handleReset}
        />
      </div>
    </div>
  );
}
