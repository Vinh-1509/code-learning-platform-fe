import { createLazyFileRoute } from '@tanstack/react-router';
import SignUpPage from '@/features/auth/SignupPage';

export const Route = createLazyFileRoute('/signup')({
  component: SignUpPage,
});
