import axios from 'axios';
export interface ApiError {
  message?: string;
}
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

// Auth API
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

// Language Selection API

import type { LanguageOption, Language } from '@/types/language_selection';

interface LanguageDetailResponse {
  _id: string;
  language: Language;
  info: string;
  strengths: string[];
  challenges: string[];
  useCases: string[];
}

export async function fetchLanguages(): Promise<LanguageOption[]> {
  const { data } = await api.get<LanguageDetailResponse[]>('/api/languages');

  return data.map((item) => ({
    id: item._id,
    language: item.language,
    tagline: item.info,
    strengths: item.strengths,
    challenges: item.challenges,
    useCases: item.useCases,
    color: {
      background: item.language === 'C++' ? 'bg-[#3730a3]' : 'bg-[#c2410c]',
      main: 'bg-accent',
    },
  }));
}

export async function saveLanguage(language: Language): Promise<void> {
  await api.post('/api/languages/select', { language });
}

// Learning API
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
  order: number;
  progress: {
    status: 'active' | 'locked' | 'completed';
    isCompleted: boolean;
    completionPercentage: number;
  };
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
  title: string;
  description?: string;
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

// Practice/Exercise API
export type ExerciseType = 'dragdrop' | 'fillblank';

export interface DragDropBlockResponse {
  id: string;
  code: string;
  indent: number;
}

export interface ExercisePartResponse {
  id: string;
  text: string;
  isBlank: boolean;
  answer?: string;
}

export interface ExerciseLineResponse {
  id: string;
  parts: ExercisePartResponse[];
  indent: number;
}

export interface DragDropExerciseResponse {
  _id: string;
  type: 'dragdrop';
  title: string;
  description: string;
  blocks: DragDropBlockResponse[];
  answer?: (string | null)[];
}

export interface FillBlankExerciseResponse {
  _id: string;
  type: 'fillblank';
  title: string;
  description: string;
  lines: ExerciseLineResponse[];
}

export type ExerciseResponse =
  | DragDropExerciseResponse
  | FillBlankExerciseResponse;

export interface SubmitAnswerResponse {
  correct: boolean;
  feedback?: string;
}

export interface HintResponse {
  hintLevel: number;
  hint: string;
}

export async function fetchExerciseById(
  exerciseId: string
): Promise<ExerciseResponse> {
  const { data } = await api.get<ExerciseResponse>(
    `/api/practice/exercises/${exerciseId}`
  );
  return data;
}

export async function submitExerciseAnswer(
  exerciseId: string,
  answer: unknown
): Promise<SubmitAnswerResponse> {
  const { data } = await api.post<SubmitAnswerResponse>(
    `/api/practice/exercises/${exerciseId}/submit`,
    { answer }
  );
  return data;
}

export async function getExerciseHint(
  exerciseId: string
): Promise<HintResponse> {
  const { data } = await api.post<HintResponse>(
    `/api/practice/exercises/${exerciseId}/hint`
  );
  return data;
}
