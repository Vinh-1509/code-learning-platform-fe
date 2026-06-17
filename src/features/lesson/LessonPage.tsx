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
  const [justPassedFeynmanBlockId, setJustPassedFeynmanBlockId] = useState<
    string | null
  >(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'theory' | 'practice'>('theory');

  const activeBlockId =
    selectedBlockId ??
    currentLesson?.blocks.find(
      (b: Block) =>
        b.status === 'active' ||
        (b.status === 'completed' && !b.isFeynmanPassed)
    )?._id ??
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
          onSelectBlock={(id) => {
            // Clear the "just passed" state so the user can revisit exercises on previously passed blocks
            if (id !== activeBlockId) {
              setJustPassedFeynmanBlockId(null);
            }
            setSelectedBlockId(id);
          }}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
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

          <div className="flex-1 overflow-y-auto p-4 h-full">
            {(() => {
              const currentBlockIndex =
                currentLesson?.blocks.findIndex(
                  (b: Block) => b._id === activeBlockId
                ) ?? 0;
              const nextBlockExists =
                (currentLesson?.blocks.length ?? 0) > currentBlockIndex + 1;

              const shouldShowFeynman =
                blockCompleted &&
                activeBlockId &&
                (!currentBlock?.isFeynmanPassed ||
                  justPassedFeynmanBlockId === activeBlockId);

              if (shouldShowFeynman) {
                return (
                  <FeynmanInterviewPane
                    lessonBlockId={activeBlockId}
                    onComplete={() => {
                      if (activeBlockId) {
                        setSelectedBlockId(activeBlockId);
                      }
                      setJustPassedFeynmanBlockId(activeBlockId);
                      void refetchLesson?.();
                    }}
                    onNextBlock={() => {
                      void refetchLesson?.().then(() => {
                        const nextBlock =
                          currentLesson?.blocks[currentBlockIndex + 1];
                        if (nextBlock) {
                          setJustPassedFeynmanBlockId(null);
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
                  />
                );
              }

              return null;
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
