import axios from 'axios';

// ─── 1. KHỞI TẠO AXIOS INSTANCE TRUNG TÂM ───────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor response (Tạm thời bỏ qua check 401 để không bị đá văng khi chưa có trang login)
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    return Promise.reject(
      error instanceof Error ? error : new Error('Unknown error')
    );
  }
);

// ─── 2. ĐỊNH NGHĨA KIỂU DỮ LIỆU ĐANG DÙNG ──────────────────────────────────
import type { LessonBlock, DraggableBlock } from '../features/lesson/types';

// ─── 3. CÁC HÀM API CHẠY THỰC TẾ CHO LESSON / PRACTICE ──────────────────────

export async function fetchSidebarLessons(): Promise<LessonBlock[]> {
  await new Promise((r) => setTimeout(r, 600)); // Giả lập độ trễ mạng 0.6s
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

// ─── 4. MOCK DATA ĐANG PHỤC VỤ CHO PAGE CỦA BẠN ────────────────────────────

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
