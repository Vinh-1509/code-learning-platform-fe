import { createLazyFileRoute } from '@tanstack/react-router';
import { Navigate } from '@tanstack/react-router';
import { getAccessToken } from '@/lib/auth';
export const Route = createLazyFileRoute('/signup')({
  component: () =>
    getAccessToken() ? <Navigate to="/dashboard" /> : <Navigate to="/signup" />,
});
