// src/routes/login.tsx
import { createLazyFileRoute, Navigate } from '@tanstack/react-router';
import { getAccessToken } from '@/lib/auth';
import { LoginPage } from '../features/auth/LoginPage';

export const Route = createLazyFileRoute('/login')({
  component: () =>
    getAccessToken() ? <Navigate to="/dashboard" /> : <LoginPage />,
});
