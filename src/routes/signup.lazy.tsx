import { createLazyFileRoute } from '@tanstack/react-router';
import { Navigate } from '@tanstack/react-router';
import { getAccessToken } from '@/lib/auth';
import SignUpPage from '@/features/auth/SignupPage';
export const Route = createLazyFileRoute('/signup')({
  component: () =>
    getAccessToken() ? (
      // User is already authenticated, redirect to
      // language selection(have guard to redirect to dashboard
      // if user has already selected language)
      <Navigate to="/languageselection" />
    ) : (
      <SignUpPage />
    ),
});
