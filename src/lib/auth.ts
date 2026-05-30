import { redirect } from '@tanstack/react-router';
import { getMe } from './axios';

export const getAccessToken = (): string | null => {
  return localStorage.getItem('token');
};

export const requireAuth = async () => {
  const token = getAccessToken();

  if (!token) {
    throw redirect({ to: '/login' });
  }

  let user;

  try {
    user = await getMe();
  } catch {
    localStorage.removeItem('token');
    throw redirect({ to: '/login' });
  }

  if (!user || !user.selectedLanguage || user.selectedLanguage.length === 0) {
    throw redirect({ to: '/languageselection' });
  }
};
export const checkLanguageSelection = async () => {
  const token = getAccessToken();

  if (!token) {
    throw redirect({ to: '/login' });
  }

  let user;

  try {
    user = await getMe();
  } catch {
    localStorage.removeItem('token');
    throw redirect({ to: '/login' });
  }

  if (user?.selectedLanguage && user.selectedLanguage.length > 0) {
    throw redirect({
      to: '/dashboard',
    });
  }
};
