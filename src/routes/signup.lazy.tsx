import { createLazyFileRoute } from '@tanstack/react-router';
import { Navigate } from '@tanstack/react-router';
import { getAccessToken } from '@/lib/auth';
import SignUpPage from '@/features/auth/SignupPage';
export const Route = createLazyFileRoute('/signup')({
  component: () =>
    getAccessToken() ? <Navigate to="/dashboard" /> : <SignUpPage />,
});
