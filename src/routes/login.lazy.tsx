// src/routes/login.tsx
import { createLazyFileRoute } from '@tanstack/react-router';
import { LoginPage } from '@/features/auth/LoginPage';

export const Route = createLazyFileRoute('/login')({
  component: LoginPage,
});
