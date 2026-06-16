import { getRouteApi, useNavigate } from '@tanstack/react-router';
import { useBlockLessons } from './useBlockLessons';
import { LessonSidebar } from './LessonSidebar';
import { TheoryPanel } from './TheoryPanel';
import { useState, useEffect } from 'react';
import type { Block } from '@/lib/axios';
import { PracticePanel } from '@/components/practice_utils/PracticePanel';
import { FeynmanInterviewPane } from '../interview/FeynmanInterviewPane';
import Navbar from '@/components/navbar/Navbar';
import { useBlockExercises } from './useBlockExercises';
import { ExerciseTabBar } from './ExerciseTabBar';

const lessonRouteApi = getRouteApi('/lesson/$lessonId');

export function LessonPage() {
  const navigate = useNavigate();
  const { lessonId } = lessonRouteApi.useParams();
  const { currentLesson, refetchLesson } = useBlockLessons({ lessonId });
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  const activeBlockId =
    selectedBlockId ??
    currentLesson?.blocks.find((b: Block) => b.status === 'active')?._id ??
    currentLesson?.blocks[0]?._id ??
    null;

  const currentBlock =
    currentLesson?.blocks.find((b: Block) => b._id === activeBlockId) ??
    undefined;

  const {
    exercises,
    loading,
    error,
    submitAnswer,
    getHint,
    explainAnswer,
    exercisePassMap,
    blockCompleted,
  } = useBlockExercises({ block: currentBlock });

  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveExerciseIndex(0);
  }, [activeBlockId]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-card">
      <Navbar variant="lesson" />

      <div className="flex flex-1 pt-14 overflow-hidden">
        <LessonSidebar
          blocks={currentLesson?.blocks || []}
          lessonTitle={currentLesson?.title}
          selectedBlockId={activeBlockId}
          onSelectBlock={setSelectedBlockId}
        />

        <div className="flex-1 overflow-y-auto bg-card">
          <TheoryPanel block={currentBlock} />
        </div>

        <div className="flex-1 min-h-0 z-10 flex flex-col shadow-[-10px_0_15px_-5px_rgba(0,0,0,0.06)] bg-card">
          <ExerciseTabBar
            loading={loading}
            error={error}
            exercises={exercises}
            exercisePassMap={exercisePassMap}
            activeExerciseIndex={activeExerciseIndex}
            setActiveExerciseIndex={setActiveExerciseIndex}
            blockCompleted={blockCompleted}
          />

          <div className="flex-1 overflow-y-auto p-4 h-full ">
            {blockCompleted &&
            currentBlock?.status === 'active' &&
            activeBlockId ? (
              (() => {
                const currentBlockIndex =
                  currentLesson?.blocks.findIndex(
                    (b: Block) => b._id === activeBlockId
                  ) ?? 0;
                const nextBlockExists =
                  (currentLesson?.blocks.length ?? 0) > currentBlockIndex + 1;

                return (
                  <FeynmanInterviewPane
                    lessonBlockId={activeBlockId}
                    onComplete={() => {
                      // Handle completion - refetch lesson to unlock next block
                      void refetchLesson?.();
                    }}
                    onNextBlock={() => {
                      // Move to next block and refetch lesson
                      void refetchLesson?.().then(() => {
                        const nextBlockIndex =
                          currentLesson?.blocks.findIndex(
                            (b: Block) => b._id === activeBlockId
                          ) ?? 0;
                        const nextBlock =
                          currentLesson?.blocks[nextBlockIndex + 1];
                        if (nextBlock) {
                          setSelectedBlockId(nextBlock._id);
                        }
                      });
                    }}
                    onBackToDashboard={() => {
                      void navigate({ to: '/dashboard' });
                    }}
                    hasNextBlock={nextBlockExists}
                  />
                );
              })()
            ) : exercises.length > 0 && exercises[activeExerciseIndex] ? (
              <PracticePanel
                key={exercises[activeExerciseIndex].id}
                exercise={exercises[activeExerciseIndex]}
                onSubmit={submitAnswer}
                onGetHint={getHint}
                onExplain={explainAnswer}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
