import axios from 'axios';

// --- INSTANCE SETUP ---
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

// src/features/auth/useAuth.ts

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

// TODO: thay bằng api.get('/languages') khi BE xong
export async function fetchLanguages(): Promise<LanguageOption[]> {
  await new Promise((r) => setTimeout(r, 800));
  return LANGUAGE_DATA;
}

// TODO: thay bằng api.post('/user/language', { language }) khi BE xong
export async function saveLanguage(language: Language): Promise<void> {
  await new Promise((r) => setTimeout(r, 600));
  console.log(language);
}

// Mock data — xóa khi có API
const LANGUAGE_DATA: LanguageOption[] = [
  {
    id: 'cpp',
    label: 'C++',
    tagline: 'Powerful, fast & foundational',
    strengths: ['Performance', 'Memory Control', 'Hardware Access'],
    challenges: ['Manual Memory', 'Complex Syntax'],
    useCases: [
      'Game Engines (Unreal)',
      'Operating Systems',
      'Embedded Systems',
    ],
    color: {
      background: 'bg-[#3730a3]',
      main: 'bg-accent',
    },
  },
  {
    id: 'java',
    label: 'Java',
    tagline: 'Readable, structured & enterprise-ready',
    strengths: ['Clean OOP', 'Rich Ecosystem', 'Platform Independent'],
    challenges: ['Verbose Code', 'Memory Heavy'],
    useCases: ['Android Development', 'Enterprise Backend', 'Big Data Systems'],
    color: {
      background: 'bg-[#c2410c]',
      main: 'bg-accent',
    },
  },
];
