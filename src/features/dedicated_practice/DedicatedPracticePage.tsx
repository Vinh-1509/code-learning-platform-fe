import { getRouteApi, useNavigate } from '@tanstack/react-router';
import { Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

import Navbar from '@/components/navbar/Navbar';
import { PracticePanel } from '@/components/practice_utils/PracticePanel';
import { useDedicatedPractice } from './useDedicatedPractice';
import { fetchExercises } from '@/lib/axios';

import { TaskPane } from './TaskPanel';

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

  useEffect(() => {
    if (!practiceInfo?.language || !practiceInfo?.level) return;

    let isMounted = true;
    void (async () => {
      try {
        const params = {
          language: practiceInfo.language,
          difficulty: practiceInfo.level,
          page: 1,
          limit: 1000,
        };
        const list = await fetchExercises(params);
        if (!isMounted) return;

        const sorted = (list.data || []).sort((a, b) => a.order - b.order);
        const currentIdx = sorted.findIndex((e) => e._id === practiceInfo._id);

        if (currentIdx !== -1) {
          const nextValidExercise = sorted
            .slice(currentIdx + 1)
            .find((e) => e.status !== 'locked');

          if (nextValidExercise) {
            setNextExerciseId(nextValidExercise._id);
          } else {
            setNextExerciseId(null);
          }
        }
      } catch (err) {
        console.error('Failed to pre-fetch next valid exercise:', err);
        setNextExerciseId(null);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [practiceInfo]);

  const taskTitle = exercise?.title ?? 'Loading...';
  const taskInstruction = exercise?.description ?? '';

  const handleNextExercise = () => {
    if (nextExerciseId) {
      void navigate({
        to: '/practicededicated/$exerciseId',
        params: { exerciseId: nextExerciseId },
      });
    }
  };

  let rightPanel = null;

  if (loading) {
    rightPanel = (
      <div className="flex min-h-[400px] items-center justify-center p-10">
        <Loader2 className="size-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!loading && error) {
    rightPanel = (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-sm text-red-600">
        {error}
      </div>
    );
  }

  if (!loading && !error && exercise) {
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

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-card">
      <Navbar variant="practice" />

      <div className="flex flex-1 overflow-hidden pt-14">
        <div className="flex-1 overflow-y-auto">
          <TaskPane title={taskTitle} instruction={taskInstruction} />
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto z-10 shadow-[-10px_0_15px_-5px_rgba(0,0,0,0.06)]">
          {rightPanel}
        </div>
      </div>
    </div>
  );
}
