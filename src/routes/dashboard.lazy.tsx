import { createLazyFileRoute } from '@tanstack/react-router';
import { DashboardPage } from '../features/dashboard/dashboardPage';

export const Route = createLazyFileRoute('/dashboard')({
  component: DashboardPage,
});
