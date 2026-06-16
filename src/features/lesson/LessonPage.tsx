import { getRouteApi, useNavigate } from '@tanstack/react-router';
import { useBlockLessons } from './useBlockLessons';
import { LessonSidebar } from './LessonSidebar';
import { TheoryPanel } from './TheoryPanel';
import { useState, useEffect } from 'react';
import type { Block } from '@/lib/axios';
import { PracticePanel } from '../practice_utils/PracticePanel';
import { FeynmanInterviewPane } from '../interview/FeynmanInterviewPane';
import Navbar from '@/components/navbar/Navbar';
import { useBlockExercises } from './useBlockExercises';
import { ExerciseTabBar } from './ExerciseTabBar';
import { cn } from '@/lib/utils';

const lessonRouteApi = getRouteApi('/lesson/$lessonId');

/**
 * LessonPage component manages the workspace layout and state for a single lesson.
 * Coordinates sidebar navigation, displays theory and code walkthroughs, and handles
 * interactive practice exercises or Feynman mock interviews.
 * Supports toggleable tabs switcher control on mobile viewports.
 *
 * @returns {JSX.Element} The rendered LessonPage component.
 */
export function LessonPage() {
  const navigate = useNavigate();
  const { lessonId } = lessonRouteApi.useParams();
  const { currentLesson, refetchLesson } = useBlockLessons({ lessonId });
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'theory' | 'practice'>('theory');

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
    setActiveTab('theory');
  }, [activeBlockId]);

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
          onSelectBlock={setSelectedBlockId}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Panels container */}
          <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
            {/* Theory panel */}
            <div
              className={cn(
                'flex-1 overflow-y-auto min-h-0',
                activeTab === 'theory' ? 'block' : 'hidden lg:block'
              )}
            >
              <div className="lg:hidden bg-blue-50/50 text-blue-600 px-6 py-2.5 text-sm font-bold border-b border-blue-100/50 select-none">
                Theory
              </div>
              <TheoryPanel block={currentBlock} />
            </div>

            {/* Practice panel */}
            <div
              className={cn(
                'flex-1 overflow-y-auto flex flex-col min-h-0 border-t lg:border-t-0 lg:border-l border-border',
                activeTab === 'practice' ? 'flex' : 'hidden lg:flex'
              )}
            >
              <div className="lg:hidden bg-blue-50/50 text-blue-600 px-6 py-2.5 text-sm font-bold border-b border-blue-100/50 select-none">
                Practice
              </div>
              <ExerciseTabBar
                loading={loading}
                error={error}
                exercises={exercises}
                exercisePassMap={exercisePassMap}
                activeExerciseIndex={activeExerciseIndex}
                setActiveExerciseIndex={setActiveExerciseIndex}
                blockCompleted={blockCompleted}
              />

              <div className="flex-1 overflow-y-auto p-4">
                {blockCompleted &&
                currentBlock?.status === 'active' &&
                activeBlockId ? (
                  (() => {
                    const currentBlockIndex =
                      currentLesson?.blocks.findIndex(
                        (b: Block) => b._id === activeBlockId
                      ) ?? 0;
                    const nextBlockExists =
                      (currentLesson?.blocks.length ?? 0) >
                      currentBlockIndex + 1;

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
      </div>
    </div>
  );
}
