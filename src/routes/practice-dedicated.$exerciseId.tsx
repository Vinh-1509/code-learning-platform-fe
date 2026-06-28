import { createFileRoute } from '@tanstack/react-router';

import { requireAuth } from '@/lib/auth';

import { DedicatedPracticePage } from '../features/dedicated_practice/DedicatedPracticePage';
import { RouteError } from '@/components/error/RouteError';

export const Route = createFileRoute('/practice-dedicated/$exerciseId')({
  beforeLoad: requireAuth,
  errorComponent: RouteError,
  component: DedicatedPracticePage,
});
