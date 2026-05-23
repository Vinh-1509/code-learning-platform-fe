import { createFileRoute, Navigate } from '@tanstack/react-router';
import { getAccessToken } from '@/lib/auth';
// redirect use in logic routing
//navigate use in component
export const Route = createFileRoute('/')({
  component: () =>
    getAccessToken() ? <Navigate to="/dashboard" /> : <Navigate to="/login" />,
});
