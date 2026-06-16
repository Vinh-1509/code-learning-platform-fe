import { createFileRoute } from '@tanstack/react-router';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { requireAuth } from '@/lib/auth';

export const Route = createFileRoute('/dashboard')({
  beforeLoad: requireAuth,
  component: DashboardPage,
});
