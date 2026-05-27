import { getRouteApi } from '@tanstack/react-router';
import { usePractice } from './usePractice';
import { LessonSidebar } from './lessonSidebar';
import { TheoryPane } from './theoryPanel';
import { useState, useEffect } from 'react';
import type { Block } from '@/lib/axios';
import { PracticePanel } from '@/features/practice/PracticePanel';
import { cn } from '@/lib/utils';
import Navbar from '@/components/sidebar/Navbar';
import { useBlockExercises } from './useBlockExercises';

const lessonRouteApi = getRouteApi('/lesson/$lessonId');

export function LessonPage() {
  const { lessonId } = lessonRouteApi.useParams();
  const { currentLesson } = usePractice({ lessonId });
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  const activeBlockId =
    selectedBlockId ??
    currentLesson?.blocks.find((b: Block) => b.status === 'active')?._id ??
    currentLesson?.blocks[0]?._id ??
    null;

  const currentBlock =
    currentLesson?.blocks.find((b: Block) => b._id === activeBlockId) ??
    undefined;

  const { exercises, loading, error, submitAnswer, getHint } =
    useBlockExercises({
      block: currentBlock,
    });
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveExerciseIndex(0);
  }, [activeBlockId]);

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

        <div className="flex-1 overflow-y-auto">
          <TheoryPane block={currentBlock} />
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col">
          {/* Question tab bar */}
          <div className="flex gap-2 p-4 border-b border-slate-200 bg-slate-50">
            {loading ? (
              <span className="text-sm text-slate-500">
                Loading exercises...
              </span>
            ) : error ? (
              <span className="text-sm text-red-500">
                Failed to load exercises
              </span>
            ) : exercises.length === 0 ? (
              <span className="text-sm text-slate-500">
                No practice available
              </span>
            ) : (
              exercises.map((ex, idx) => (
                <button
                  key={ex.id}
                  onClick={() => setActiveExerciseIndex(idx)}
                  className={cn(
                    'px-3 py-1.5 text-xs font-bold rounded-lg transition-colors',
                    activeExerciseIndex === idx
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                  )}
                >
                  Question {idx + 1}
                </button>
              ))
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {exercises.length > 0 && exercises[activeExerciseIndex] && (
              <PracticePanel
                key={exercises[activeExerciseIndex].id}
                exercise={exercises[activeExerciseIndex]}
                onSubmit={submitAnswer}
                onGetHint={getHint}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
