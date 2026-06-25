import { createFileRoute } from '@tanstack/react-router';

import { requireAuth } from '@/lib/auth';

import { DedicatedPracticePage } from '../features/dedicated_practice/DedicatedPracticePage';

export const Route = createFileRoute('/practice-dedicated/$exerciseId')({
  beforeLoad: requireAuth,
  component: DedicatedPracticePage,
});
