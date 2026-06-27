import { getRouteApi, useNavigate } from '@tanstack/react-router';
import { Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

import Navbar from '@/components/navbar/Navbar';
import { PracticePanel } from '@/components/practice_utils/PracticePanel';
import { useDedicatedPractice } from './useDedicatedPractice';
import { fetchExercises } from '@/features/practices/api/practice.api';
import { TaskPane } from './TaskPanel';

const PracticeRouteApi = getRouteApi('/practice-dedicated/$exerciseId');

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

        const sorted = (list.data || []).sort((a, b) => a.order - b.order);
        const currentIdx = sorted.findIndex((e) => e._id === practiceInfo._id);

        if (currentIdx !== -1) {
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

  const handleNextExercise = () => {
    if (nextExerciseId) {
      void navigate({
        to: '/practice-dedicated/$exerciseId',
        params: { exerciseId: nextExerciseId },
      });
    }
  };

  let practiceContent = null;

  if (loading) {
    practiceContent = (
      <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-border bg-card">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  } else if (error) {
    practiceContent = (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        {error}
      </div>
    );
  } else if (exercise) {
    practiceContent = (
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
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
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar variant="practice" />

      <main className="flex-1 pt-14">
        <div className="mx-auto max-w-3xl px-4 py-8 space-y-3">
          <TaskPane title={taskTitle} instruction={taskInstruction} />
          {practiceContent}
        </div>
      </main>
    </div>
  );
}
