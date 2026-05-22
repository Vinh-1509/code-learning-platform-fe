import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(
      error instanceof Error ? error : new Error('Unknown error')
    );
  }
);

import type { AuthPayload, AuthResponse } from '@/types/auth';

export async function loginUser(payload: AuthPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', payload);
  return data;
}

export async function registerUser(
  payload: AuthPayload
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/register', payload);
  return data;
}

import type { LanguageOption, Language } from '@/types/language_selection';

export async function fetchLanguages(): Promise<LanguageOption[]> {
  const { data } =
    await api.get<{ language: string; info: string }[]>('/languages');
  return data.map((lang) => ({
    id: lang.language.toLowerCase(),
    label: lang.language,
    tagline: `Learn ${lang.language}`,
    strengths: [],
    challenges: [],
    useCases: [],
    color: {
      background: lang.language === 'Java' ? 'bg-[#c2410c]' : 'bg-[#3730a3]',
      main: 'bg-accent',
    },
  }));
}

export async function saveLanguage(language: Language): Promise<void> {
  await api.post('/languages/select', { language });
}
