import { createLazyFileRoute, Navigate } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/lesson')({
  component: () => <Navigate to="/dashboard" />,
});
