import { getRouteApi } from '@tanstack/react-router';
import { Loader2 } from 'lucide-react';

import Navbar from '@/components/navbar/Navbar';
import { PracticePanel } from '@/features/practice_utils/PracticePanel';
import { useDedicatedPractice } from './useDedicatedPractice';

import { TaskPane } from './TaskPane';

const PracticeRouteApi = getRouteApi('/practicededicated/$exerciseId');

export function DedicatedPracticePage() {
  const { exerciseId } = PracticeRouteApi.useParams();
  const { exercise, loading, error, submitAnswer, getHint, explainAnswer } =
    useDedicatedPractice(exerciseId);

  const taskTitle = exercise?.title ?? 'Loading...';
  const taskInstruction = exercise?.description ?? '';

  const showLoading = loading;
  const showError = !loading && error;
  const showPractice = !loading && !error && exercise;

  let rightPanel = null;

  if (showLoading) {
    rightPanel = (
      <div className="flex min-h-[400px] items-center justify-center p-10">
        <Loader2 className="size-10 animate-spin text-primary" />
      </div>
    );
  }

  if (showError) {
    rightPanel = (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-sm text-red-600">
        {error}
      </div>
    );
  }

  if (showPractice && exercise) {
    rightPanel = (
      <PracticePanel
        exercise={exercise}
        showDescription={false}
        onSubmit={submitAnswer}
        onGetHint={getHint}
        onExplain={explainAnswer}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-card">
      <Navbar variant="lesson" />

      <div className="flex flex-1 overflow-hidden pt-14">
        <div className="flex-1 overflow-y-auto">
          <TaskPane title={taskTitle} instruction={taskInstruction} />
        </div>

        <div className="flex-1 overflow-y-auto z-10 shadow-[-10px_0_15px_-5px_rgba(0,0,0,0.06)]">
          {rightPanel}
        </div>
      </div>
    </div>
  );
}
