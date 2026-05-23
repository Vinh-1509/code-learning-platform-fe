// src/routes/login.tsx
import { createLazyFileRoute, Navigate } from '@tanstack/react-router';
import { getAccessToken } from '@/lib/auth';

export const Route = createLazyFileRoute('/login')({
  component: () =>
    getAccessToken() ? <Navigate to="/dashboard" /> : <Navigate to="/login" />,
});
