import { createFileRoute } from '@tanstack/react-router';

import { requireAuth } from '@/lib/auth';

import { RouteError } from '@/components/error/RouteError';

export const Route = createFileRoute('/practice-dedicated/$exerciseId')({
  beforeLoad: requireAuth,
  errorComponent: RouteError,
});
