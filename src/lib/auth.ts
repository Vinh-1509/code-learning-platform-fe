import { redirect } from '@tanstack/react-router';

export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

export const requireAuth = () => {
  const token = getAccessToken();
  if (!token) {
    return redirect({
      to: '/login',
    });
  }
};
