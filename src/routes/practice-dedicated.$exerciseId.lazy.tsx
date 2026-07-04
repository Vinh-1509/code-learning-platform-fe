import { createLazyFileRoute } from '@tanstack/react-router';
import { DedicatedPracticePage } from '../features/dedicated_practice/DedicatedPracticePage';

export const Route = createLazyFileRoute('/practice-dedicated/$exerciseId')({
  component: DedicatedPracticePage,
});
