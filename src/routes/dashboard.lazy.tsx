import { createLazyFileRoute } from '@tanstack/react-router';
import { DashboardPage } from '../features/dashboard/DashboardPage';

export const Route = createLazyFileRoute('/dashboard')({
  component: DashboardPage,
});
