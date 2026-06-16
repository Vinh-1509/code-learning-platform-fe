import { createFileRoute } from '@tanstack/react-router';

import { requireAuth } from '@/lib/auth';

import { DedicatedPracticePage } from '../features/dedicated_practice/DedicatedPracticePage';

export const Route = createFileRoute('/practicededicated/$exerciseId')({
  beforeLoad: requireAuth,
  component: DedicatedPracticePage,
});
