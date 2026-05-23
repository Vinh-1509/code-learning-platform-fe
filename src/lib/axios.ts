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

import type { AuthPayload, AuthResponse, AuthUserResponse } from '@/types/auth';

export async function loginUser(payload: AuthPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/api/auth/login', payload);
  return data;
}

export async function registerUser(
  payload: AuthPayload
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/api/auth/register', payload);
  return data;
}

export async function getMe(): Promise<AuthUserResponse> {
  const { data } = await api.get<AuthUserResponse>('/api/auth/me');
  return data;
}

import type { LanguageOption, Language } from '@/types/language_selection';

interface LanguageListItem {
  _id: string;
  language: Language;
}

interface LanguageDetailResponse {
  _id: string;
  language: Language;
  info: string;
  strengths: string[];
  challenges: string[];
  useCases: string[];
}

export async function fetchLanguages(): Promise<LanguageOption[]> {
  const { data } = await api.get<LanguageListItem[]>('/api/languages');

  const languageDetails = await Promise.all(
    data.map(async (item) => getLanguageDetails(item._id))
  );

  return languageDetails;
}

export async function getLanguageDetails(
  languageId: string
): Promise<LanguageOption> {
  const { data } = await api.get<LanguageDetailResponse>(
    `/api/languages/${languageId}`
  );

  return {
    id: data._id,
    language: data.language,
    tagline: data.info,
    strengths: data.strengths,
    challenges: data.challenges,
    useCases: data.useCases,
    color: {
      background: data.language === 'C++' ? 'bg-[#3730a3]' : 'bg-[#c2410c]',
      main: 'bg-accent',
    },
  };
}

export async function saveLanguage(language: Language): Promise<void> {
  await api.post('/api/languages/select', { language });
}
export interface ApiError {
  message?: string;
}

export interface MilestoneResponse {
  _id: string;
  title: string;
  description: string;
  order: number;
  progress: {
    status: 'Active' | 'Locked' | 'Completed';
    completionPercentage: number;
  };
}
export interface LessonResponse {
  _id: string;
  title: string;
  status: 'done' | 'current' | 'locked';
}
export interface ContentItem {
  type: 'theory' | 'code';
  data: {
    order: number;
    text?: string;
    code?: string;
    explanation?: string;
  };
}

export interface Block {
  _id: string;
  content: ContentItem[];
  feynmanQuestion: string;
  state: 'active' | 'locked' | 'completed';
  isFeynmanPassed: boolean;
}

export interface LessonDetailResponse {
  _id: string;
  title: string;
  order: number;
  blocks: Block[];
  progress: {
    completionPercentage: number;
    isCompleted: boolean;
    lastAccessed?: string;
  };
}

export async function fetchLessonById(
  lessonId: string
): Promise<LessonDetailResponse> {
  const { data } = await api.get<LessonDetailResponse>(
    `/api/learning/lessons/${lessonId}`
  );
  return data;
}

export async function fetchMilestones(): Promise<MilestoneResponse[]> {
  const { data } = await api.get<MilestoneResponse[]>(
    '/api/learning/milestones'
  );
  return data;
}

export async function fetchLessonsByMilestone(
  milestoneId: string
): Promise<LessonResponse[]> {
  const { data } = await api.get<LessonResponse[]>(
    `/api/learning/milestones/${milestoneId}/lessons`
  );
  return data;
}
