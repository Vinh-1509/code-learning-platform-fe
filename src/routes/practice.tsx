import { createFileRoute } from '@tanstack/react-router';
import { requireAuth } from '@/lib/auth';

import { PracticePage } from '../features/practices/PracticePage';
export const Route = createFileRoute('/practice')({
  beforeLoad: requireAuth,

  component: PracticePage,
});
