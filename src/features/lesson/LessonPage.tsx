import { getRouteApi, useNavigate } from '@tanstack/react-router';
import { useBlockLessons } from './hooks/useBlockLessons';
import { LessonSidebar } from './LessonSidebar';
import { TheoryPanel } from './TheoryPanel';
import { useState, useEffect } from 'react';
import type { Block } from '@/types/api/learning.types';
import { PracticePanel } from '@/components/practice_utils/PracticePanel';
import { FeynmanInterviewPane } from '../interview/FeynmanInterviewPane';
import Navbar from '@/components/navbar/Navbar';
import { useBlockExercises } from './hooks/useBlockExercises';
import { ExerciseTabBar } from './ExerciseTabBar';
import { useTour } from '@/components/tour/TourProvider';
import { cn } from '@/lib/utils';

const lessonRouteApi = getRouteApi('/lesson/$lessonId');

/**
 * LessonPage component manages the workspace layout and state for a single lesson.
 * Coordinates sidebar navigation, displays theory and code walkthroughs, and handles
 * interactive practice exercises or Feynman mock interviews.
 * Supports toggleable tabs switcher control on mobile viewports.
 *
 */
export function LessonPage() {
  const navigate = useNavigate();
  const { lessonId } = lessonRouteApi.useParams();
  const { currentLesson, refetchLesson } = useBlockLessons({ lessonId });

  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'theory' | 'code' | 'practice' | 'description'
  >('theory');
  const [isGachaDone, setIsGachaDone] = useState(false);
  const activeBlockId =
    selectedBlockId ??
    currentLesson?.blocks.find((b) => b.status === 'active')?._id ??
    currentLesson?.blocks[0]?._id ??
    null;

  const currentBlock =
    currentLesson?.blocks.find((b: Block) => b._id === activeBlockId) ??
    undefined;

  const [feynmanPassedBlockId, setFeynmanPassedBlockId] = useState<
    string | null
  >(null);

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
    setActiveTab('theory');
    setIsGachaDone(false);
  }, [activeBlockId]);

  const shouldShowFeynman =
    activeBlockId &&
    ((blockCompleted &&
      currentBlock?.status === 'active' &&
      currentBlock?.isFeynmanPassed === false) ||
      feynmanPassedBlockId === activeBlockId);

  useEffect(() => {
    if (shouldShowFeynman) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveTab('practice');
    }
  }, [shouldShowFeynman]);

  // On mobile, only one of theory/practice is visible at a time (controlled
  // by activeTab). Force the matching tab into view while the tour is
  // pointing at it, so the target isn't hidden behind the other tab.
  // No-op on desktop, since both panels render regardless of activeTab there.
  const { stepIndex, wantRun } = useTour();

  useEffect(() => {
    if (!wantRun) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stepIndex === 3) setActiveTab('theory');
    else if (stepIndex === 4) setActiveTab('practice');
  }, [stepIndex, wantRun]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-card">
      <Navbar
        variant="lesson"
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
      />

      <div className="flex flex-1 pt-14 overflow-hidden">
        <LessonSidebar
          blocks={currentLesson?.blocks || []}
          lessonTitle={currentLesson?.title}
          selectedBlockId={activeBlockId}
          onSelectBlock={(id) => {
            setSelectedBlockId(id);
          }}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Panels container */}
          <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
            {/* Theory panel */}
            <div
              data-tour="lesson-theory"
              className={cn(
                'flex-1 overflow-y-auto min-h-0 bg-card',
                activeTab === 'theory' ? 'block' : 'hidden lg:block'
              )}
            >
              <div
                data-tour="lesson-theory-mobile"
                className="lg:hidden bg-primary-second/50 text-primary px-6 py-2.5 text-sm font-bold border-b border-primary-second-border/50 select-none"
              >
                Theory
              </div>
              <TheoryPanel block={currentBlock} />
            </div>

            {/* Practice panel */}
            <div
              data-tour="lesson-practice"
              className={cn(
                'flex-1 min-h-0 z-10 flex flex-col shadow-[-10px_0_15px_-5px_rgba(0,0,0,0.06)] bg-card border-t lg:border-t-0 lg:border-l border-border',
                activeTab === 'practice' ? 'flex' : 'hidden lg:flex'
              )}
            >
              <div
                data-tour="lesson-practice-mobile"
                className="lg:hidden bg-primary-second/50 text-primary px-6 py-2.5 text-sm font-bold border-b border-primary-second-border/50 select-none"
              >
                Practice
              </div>
              <ExerciseTabBar
                loading={loading}
                error={error}
                exercises={exercises}
                exercisePassMap={exercisePassMap}
                activeExerciseIndex={activeExerciseIndex}
                setActiveExerciseIndex={setActiveExerciseIndex}
              />

              <div className="flex-1 overflow-y-auto p-4 h-full">
                {(() => {
                  const currentBlockIndex =
                    currentLesson?.blocks.findIndex(
                      (b: Block) => b._id === activeBlockId
                    ) ?? 0;
                  const nextBlockExists =
                    (currentLesson?.blocks.length ?? 0) > currentBlockIndex + 1;

                  const shouldShowFeynman =
                    activeBlockId &&
                    isGachaDone &&
                    ((blockCompleted &&
                      currentBlock?.status === 'active' &&
                      currentBlock?.isFeynmanPassed === false) ||
                      feynmanPassedBlockId === activeBlockId);

                  if (shouldShowFeynman) {
                    return (
                      <FeynmanInterviewPane
                        lessonBlockId={activeBlockId}
                        lessonId={lessonId}
                        onComplete={() => {
                          if (activeBlockId) {
                            setSelectedBlockId(activeBlockId);
                            setFeynmanPassedBlockId(activeBlockId); // hold the conversation
                          }
                          void refetchLesson?.();
                        }}
                        onNextBlock={() => {
                          void refetchLesson?.().then(() => {
                            const nextBlock =
                              currentLesson?.blocks[currentBlockIndex + 1];
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
                  }

                  if (exercises.length > 0 && exercises[activeExerciseIndex]) {
                    return (
                      <PracticePanel
                        key={exercises[activeExerciseIndex].id}
                        exercise={exercises[activeExerciseIndex]}
                        onSubmit={submitAnswer}
                        onGetHint={getHint}
                        onExplain={explainAnswer}
                        onGachaClose={() => {
                          setIsGachaDone(true);
                        }}
                      />
                    );
                  }

                  return null;
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
