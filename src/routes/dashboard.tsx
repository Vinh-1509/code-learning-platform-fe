import { createFileRoute } from '@tanstack/react-router';
import { DashboardPage } from '../features/dashboard/dashboardPage';

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
});
