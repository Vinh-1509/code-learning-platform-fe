// src/routes/login.tsx
import { createLazyFileRoute, Navigate } from '@tanstack/react-router';
import { getAccessToken } from '@/lib/auth';
import { LoginPage } from '../features/auth/LoginPage';

export const Route = createLazyFileRoute('/login')({
  component: () =>
    getAccessToken() ? (
      // User is already authenticated, redirect to
      // language selection(have guard to redirect to dashboard
      // if user has already selected language)
      <Navigate to="/languageselection" />
    ) : (
      <LoginPage />
    ),
});
