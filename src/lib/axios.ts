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
    status: 'active' | 'locked' | 'completed';
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
  type: 'theory' | 'code' | 'practice';
  data: {
    order: number;
    text?: string;
    code?: string;
    explanation?: string;
    exerciseId?: string;
    required?: boolean;
  };
}

export interface Block {
  _id: string;
  title: string;
  description?: string;
  content: ContentItem[];
  feynmanQuestion: string;
  status: 'active' | 'locked' | 'completed';
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
export type ExerciseType = 'drag_drop' | 'fill_blank';

export interface DragDropBlockResponse {
  id: string;
  code: string;
  indent: number;
}

export interface DragDropExerciseResponse {
  _id: string;
  type: 'drag_drop';
  title: string;
  instruction: string;
  language: string;
  level: string;
  order: number;
  data: {
    blocks: DragDropBlockResponse[];
    answer?: (string | null)[];
  };
  hints?: Record<string, string>;
}

export interface FillBlankExerciseResponse {
  _id: string;
  type: 'fill_blank';
  title: string;
  instruction: string;
  language: string;
  level: string;
  order: number;
  data: {
    template: string[];
    placeholders: Record<string, string>;
  };
  hints?: Record<string, string>;
}

export type ExerciseResponse =
  | DragDropExerciseResponse
  | FillBlankExerciseResponse;

export interface SubmitAnswerItem {
  field: string;
  isCorrect: boolean;
}

export interface SubmitAnswerResponse {
  correct: boolean;
  items?: SubmitAnswerItem[];
  attemptNumber?: number;
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
  exerciseId: string,
  level?: number
): Promise<HintResponse> {
  const { data } = await api.post<HintResponse>(
    `/api/practice/exercises/${exerciseId}/hint`,
    { level }
  );
  return data;
}

export interface ExerciseAttemptResponse {
  _id: string;
  exerciseId: string;
  isPassed: boolean;
  items: SubmitAnswerItem[];
  hintLevel: number;
  userAnswer?: unknown;
  attemptNumber: number;
  attemptedAt: string;
}

export async function getExerciseHistory(
  exerciseId: string
): Promise<ExerciseAttemptResponse[]> {
  const { data } = await api.get<ExerciseAttemptResponse[]>(
    `/api/practice/exercises/${exerciseId}/history`
  );
  return data;
}

// Exercise explanation (AI)
export interface ExplainAnswerItem {
  field: string;
  isCorrect: boolean;
  explanation: string;
}

export interface ExplainAnswerResponse {
  exerciseId: string;
  isCorrect: boolean;
  feedback: string;
  items: ExplainAnswerItem[];
  suggestion?: string;
}

export async function explainExerciseAnswer(
  exerciseId: string,
  answer: unknown
): Promise<ExplainAnswerResponse> {
  const { data } = await api.post<ExplainAnswerResponse>(
    `/api/exercises/${exerciseId}/explain`,
    { answer }
  );
  return data;
}

// Block completion
export interface BlockCompleteResponse {
  message: string;
  lessonProgress: {
    status: string;
    completionPercentage: number;
    isCompleted: boolean;
  };
}

export async function completeBlock(
  blockId: string
): Promise<BlockCompleteResponse> {
  const { data } = await api.post<BlockCompleteResponse>(
    `/api/learning/blocks/${blockId}/complete`
  );
  return data;
}
