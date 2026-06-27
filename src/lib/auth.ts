import { isRedirect, redirect } from '@tanstack/react-router';
import { queryClient } from '@/lib/queryClient';
import { queryKeys } from '@/lib/queryKeys';
import { getMe } from '@/features/auth/api/auth.api';

export const getAccessToken = (): string | null => {
  return localStorage.getItem('token');
};

export const requireAuth = async () => {
  const token = getAccessToken();
  console.log('requireAuth token:', token);

  if (!token) throw redirect({ to: '/login' });

  try {
    const user = await queryClient.ensureQueryData({
      queryKey: queryKeys.auth.me(),
      queryFn: getMe,
      staleTime: 5 * 60_000,
    });
    console.log('requireAuth user:', user);

    if (!user?.selectedLanguage || user.selectedLanguage.length === 0) {
      throw redirect({ to: '/language-selection' });
    }
  } catch (err) {
    console.log('requireAuth catch:', err); // ← xem err là gì
    if (isRedirect(err)) throw err;
    localStorage.removeItem('token');
    throw redirect({ to: '/login' });
  }
};

export const checkLanguageSelection = async () => {
  const token = getAccessToken();

  if (!token) throw redirect({ to: '/login' });

  try {
    const user = await queryClient.ensureQueryData({
      queryKey: queryKeys.auth.me(),
      queryFn: getMe,
      staleTime: 5 * 60_000,
    });

    if (user?.selectedLanguage && user.selectedLanguage.length > 0) {
      throw redirect({ to: '/dashboard' });
    }
  } catch (err) {
    if (isRedirect(err)) throw err;
    localStorage.removeItem('token');
    throw redirect({ to: '/login' });
  }
};
