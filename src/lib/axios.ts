import axios from 'axios';

// ─── 1. KHỞI TẠO AXIOS INSTANCE ───────────────────────────────────────────
const api = axios.create({
  //  Đã sửa: Ép kiểu tường minh tránh lỗi unsafe-assignment dòng 5
  baseURL: import.meta.env.VITE_API_URL as string,
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

// ─── 2. ĐỊNH NGHĨA CÁC TYPES ──────────────────────────────────────────────
import type { AuthPayload, AuthResponse } from '@/types/auth';
import type { LanguageOption, Language } from '@/types/language_selection';
import type { LessonBlock, DraggableBlock } from '../features/lesson/types';

// ─── 3. CÁC HÀM API AUTHENTICATION ────────────────────────────────────────
export async function loginUser(payload: AuthPayload): Promise<AuthResponse> {
  /* eslint-disable @typescript-eslint/no-unsafe-assignment */
  const { data } = await api.post<AuthResponse>('/auth/login', payload);
  return data;
}

export async function registerUser(
  payload: AuthPayload
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/register', payload);
  return data;
}

// ─── 4. CÁC HÀ M API LANGUAGE SELECTION ────────────────────────────────────
export async function fetchLanguages(): Promise<LanguageOption[]> {
  await new Promise((r) => setTimeout(r, 800));
  return LANGUAGE_DATA;
}

export async function saveLanguage(language: Language): Promise<void> {
  await new Promise((r) => setTimeout(r, 600));
  console.log(language);
}

// ─── 5. CÁC HÀM API LESSON PRACTICE ───────────────────────────────────────

export async function fetchSidebarLessons(): Promise<LessonBlock[]> {
  await new Promise((r) => setTimeout(r, 600));
  return SIDEBAR_LESSON_DATA;
}

export async function fetchAvailableBlocks(): Promise<DraggableBlock[]> {
  await new Promise((r) => setTimeout(r, 500));
  return AVAILABLE_BLOCKS_DATA;
}

export async function checkAnswerAPI(
  droppedIds: (string | null)[]
): Promise<{ success: boolean }> {
  await new Promise((r) => setTimeout(r, 700));
  const correct = droppedIds[0] === 'blk-a' && droppedIds[1] === 'blk-b';
  return { success: correct };
}

// ─── 6. TOÀN BỘ MOCK DATA TRONG HỆ THỐNG ───────────────────────────────────

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
    color: { background: 'bg-[#3730a3]', main: 'bg-accent' },
  },
  {
    id: 'java',
    label: 'Java',
    tagline: 'Readable, structured & enterprise-ready',
    strengths: ['Clean OOP', 'Rich Ecosystem', 'Platform Independent'],
    challenges: ['Verbose Code', 'Memory Heavy'],
    useCases: ['Android Development', 'Enterprise Backend', 'Big Data Systems'],
    color: { background: 'bg-[#c2410c]', main: 'bg-accent' },
  },
];

const SIDEBAR_LESSON_DATA: LessonBlock[] = [
  {
    id: 1,
    title: 'What is a Loop?',
    subtitle: 'for, while basics',
    tag: 'Block 1',
    status: 'completed',
  },
  {
    id: 2,
    title: 'While Loop',
    subtitle: 'Syntax & condition',
    tag: 'Block 2',
    status: 'completed',
  },
  {
    id: 3,
    title: 'For Loop',
    subtitle: 'Range & iteration',
    tag: 'Block 3',
    status: 'active',
  },
  {
    id: 4,
    title: 'Nested Loops',
    subtitle: 'Loops inside loops',
    tag: 'Block 4',
    status: 'locked',
  },
  {
    id: 5,
    title: 'Loop Control',
    subtitle: 'break, continue',
    tag: 'Block 5',
    status: 'locked',
  },
];

const AVAILABLE_BLOCKS_DATA: DraggableBlock[] = [
  { id: 'blk-a', code: 'for i in range(3):', indent: 0 },
  { id: 'blk-b', code: 'print(i)', indent: 1 },
  { id: 'blk-c', code: 'i = i + 1', indent: 0 },
];
