import { getRouteApi, useNavigate } from '@tanstack/react-router';
import { Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

import Navbar from '@/components/navbar/Navbar';
import { PracticePanel } from '@/components/practice_utils/PracticePanel';
import { useDedicatedPractice } from './useDedicatedPractice';
import { fetchExercises } from '@/lib/axios';
import { TaskPane } from './TaskPanel';

import { cn } from '@/lib/utils';

const PracticeRouteApi = getRouteApi('/practicededicated/$exerciseId');

interface ExerciseResponse {
  _id: string;
  language: string;
  level: string;
  order: number;
}

export function DedicatedPracticePage() {
  const { exerciseId } = PracticeRouteApi.useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    'theory' | 'code' | 'practice' | 'description'
  >('description');

  // Custom hook containing state management for fetching/submitting challenges
  const {
    exercise,
    rawResponse,
    loading,
    error,
    lastSubmitCorrect,
    submitAnswer,
    getHint,
    explainAnswer,
  } = useDedicatedPractice(exerciseId);

  const practiceInfo = rawResponse as ExerciseResponse | null;
  const [nextExerciseId, setNextExerciseId] = useState<string | null>(null);

  // Effect to discover and pre-cache the next eligible/unlocked exercise
  useEffect(() => {
    if (!practiceInfo?.language || !practiceInfo?.level) return;

    let isMounted = true;

    const prefetchNextExercise = async () => {
      try {
        const params = {
          language: practiceInfo.language,
          difficulty: practiceInfo.level,
          page: 1,
          limit: 1000,
        };

        const list = await fetchExercises(params);
        if (!isMounted) return;

        // Sequence challenges according to curriculum ordering schema
        const sorted = (list.data || []).sort((a, b) => a.order - b.order);
        const currentIdx = sorted.findIndex((e) => e._id === practiceInfo._id);

        if (currentIdx !== -1) {
          // Identify nearest available challenge that isn't locked down
          const nextValidExercise = sorted
            .slice(currentIdx + 1)
            .find((e) => e.status !== 'locked');

          setNextExerciseId(nextValidExercise ? nextValidExercise._id : null);
        }
      } catch (err) {
        console.error('Failed to pre-fetch next valid exercise:', err);
        if (isMounted) setNextExerciseId(null);
      }
    };

    void prefetchNextExercise();

    return () => {
      isMounted = false;
    };
  }, [practiceInfo]);

  const taskTitle = exercise?.title ?? 'Loading...';
  const taskInstruction = exercise?.description ?? '';

  // Handle route change when user clicks to progress to next challenge
  const handleNextExercise = () => {
    if (nextExerciseId) {
      void navigate({
        to: '/practicededicated/$exerciseId',
        params: { exerciseId: nextExerciseId },
      });
    }
  };

  // Content determination switcher based on loading state tree
  let rightPanel = null;

  if (loading) {
    rightPanel = (
      <div className="flex min-h-[400px] items-center justify-center p-10">
        <Loader2 className="size-10 animate-spin text-primary" />
      </div>
    );
  } else if (error) {
    rightPanel = (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-sm text-red-600 mx-6 my-4">
        {error}
      </div>
    );
  } else if (exercise) {
    rightPanel = (
      <div className="h-full flex flex-col">
        <PracticePanel
          exercise={exercise}
          showDescription={false}
          onSubmit={submitAnswer}
          onGetHint={getHint}
          onExplain={explainAnswer}
          onNext={
            lastSubmitCorrect && nextExerciseId ? handleNextExercise : undefined
          }
        />
      </div>
    );
  }

  const isCpp = practiceInfo?.language === 'C++';
  const tabHeaderStyle = isCpp
    ? 'lg:hidden bg-purple-jv-background/50 text-purple-cpp px-6 py-2.5 text-sm font-bold border-b border-purple-cpp/20 select-none'
    : 'lg:hidden bg-orange-jv-background/50 text-orange-jv px-6 py-2.5 text-sm font-bold border-b border-orange-jv/20 select-none';

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-card">
      <Navbar
        variant="practice"
        activeTab={activeTab}
        onChangeTab={setActiveTab}
      />

      {/* Main split-pane workspace workspace container */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden pt-14">
        {/* Left Side: Instructions Column */}
        <div
          className={cn(
            'flex-1 overflow-y-auto border-r border-border/40 bg-card',
            activeTab === 'description' ? 'block' : 'hidden lg:block'
          )}
        >
          <div className={tabHeaderStyle}>Description</div>
          <TaskPane title={taskTitle} instruction={taskInstruction} />
        </div>

        {/* Right Side: Execution Dashboard Panel */}
        <div
          className={cn(
            'flex-1 min-h-0 overflow-y-auto z-10 shadow-[-10px_0_15px_-5px_rgba(0,0,0,0.06)] bg-background',
            activeTab === 'code' ? 'block' : 'hidden lg:block'
          )}
        >
          <div className={tabHeaderStyle}>Code</div>
          {rightPanel}
        </div>
      </div>
    </div>
  );
}
