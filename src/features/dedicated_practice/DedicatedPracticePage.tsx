import { getRouteApi, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

import Navbar from '@/components/navbar/Navbar';
import { PracticePanel } from '@/components/practice_utils/PracticePanel';
import { useDedicatedPractice } from './hooks/useDedicatedPractice';
import { fetchExercises } from '@/features/practices/api/practice.api';
import { queryKeys } from '@/lib/queryKeys';
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

  // ── Next-exercise lookup ───────────────────────────────────────────────────
  // Reuses the exact same query key/params shape as usePractice's filtered
  // grid query, so navigating Practice Library → Dedicated Practice doesn't
  // trigger a duplicate network request if the list is already cached.
  const nextExerciseParams = practiceInfo
    ? {
        language: practiceInfo.language,
        difficulty: practiceInfo.level,
        page: 1,
        limit: 1000,
      }
    : null;

  const { data: siblingExercisesData } = useQuery({
    queryKey: queryKeys.exercises.list(nextExerciseParams ?? {}),
    queryFn: () => fetchExercises(nextExerciseParams!),
    enabled: Boolean(nextExerciseParams),
    staleTime: 30_000,
  });

  const nextExerciseId = (() => {
    if (!practiceInfo || !siblingExercisesData) return null;

    const sorted = (siblingExercisesData.data || []).sort(
      (a, b) => a.order - b.order
    );
    const currentIdx = sorted.findIndex((e) => e._id === practiceInfo._id);

    if (currentIdx === -1) return null;

    const nextValidExercise = sorted
      .slice(currentIdx + 1)
      .find((e) => e.status !== 'locked');

    return nextValidExercise ? nextValidExercise._id : null;
  })();

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
