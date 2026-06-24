import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock TanStack redirect so it throws a trackable object instead of performing real navigation
vi.mock('@tanstack/react-router', () => ({
  redirect: vi.fn((opts: { to: string }) => ({
    __redirect: true,
    to: opts.to,
  })),
}));

// Mock the lesson API file/module where fetchLessonById lives
vi.mock('@/features/lesson/api/lesson.api', () => ({
  fetchLessonById: vi.fn(),
}));

import { requireAccessibleLesson } from '@/lib/lessonGuard';
import { fetchLessonById } from '@/features/lesson/api/lesson.api';
import { redirect } from '@tanstack/react-router';

// Import the actual type from types definitions
import type { LessonDetailResponse } from '@/types/api/learning.types';

describe('requireAccessibleLesson()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should resolve and return the lesson if at least one block is not locked', async () => {
    const mockLesson = {
      id: 'lesson-1',
      blocks: [
        { id: 'b1', status: 'completed' },
        { id: 'b2', status: 'locked' },
      ],
    } as unknown as LessonDetailResponse; // <-- Type cast here to satisfy TS

    vi.mocked(fetchLessonById).mockResolvedValueOnce(mockLesson);

    const result = await requireAccessibleLesson('lesson-1');

    expect(fetchLessonById).toHaveBeenCalledWith('lesson-1');
    expect(result).toEqual(mockLesson);
    expect(redirect).not.toHaveBeenCalled();
  });

  it('should resolve and return the lesson if it has no blocks array (edge case safety)', async () => {
    const mockLesson = {
      id: 'lesson-empty',
    } as unknown as LessonDetailResponse;
    vi.mocked(fetchLessonById).mockResolvedValueOnce(mockLesson);

    const result = await requireAccessibleLesson('lesson-empty');

    expect(result).toEqual(mockLesson);
    expect(redirect).not.toHaveBeenCalled();
  });

  it('should throw a redirect to dashboard if all blocks are locked', async () => {
    const mockLesson = {
      id: 'lesson-locked',
      blocks: [
        { id: 'b1', status: 'locked' },
        { id: 'b2', status: 'locked' },
      ],
    } as unknown as LessonDetailResponse;
    vi.mocked(fetchLessonById).mockResolvedValueOnce(mockLesson);

    await expect(requireAccessibleLesson('lesson-locked')).rejects.toEqual({
      __redirect: true,
      to: '/dashboard',
    });

    expect(fetchLessonById).toHaveBeenCalledWith('lesson-locked');
    expect(redirect).toHaveBeenCalledWith({ to: '/dashboard' });
  });

  it('should propagate API errors cleanly if the fetch fails', async () => {
    const networkError = new Error('Network Error');
    vi.mocked(fetchLessonById).mockRejectedValueOnce(networkError);

    await expect(requireAccessibleLesson('lesson-broken')).rejects.toThrow(
      'Network Error'
    );
    expect(redirect).not.toHaveBeenCalled();
  });
});
