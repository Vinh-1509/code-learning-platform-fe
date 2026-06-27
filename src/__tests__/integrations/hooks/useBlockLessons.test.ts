import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useBlockLessons } from '@/features/lesson/useBlockLessons';
import { fetchLessonById } from '@/features/lesson/api/lesson.api';
import type { LessonDetailResponse } from '@/types/api/learning.types';

// Mock the lesson API layer module
vi.mock('@/features/lesson/api/lesson.api', () => ({
  fetchLessonById: vi.fn(),
}));

describe('useBlockLessons()', () => {
  const mockLessonData = {
    _id: 'lesson-123',
    title: 'Introduction to C++',
    blocks: [],
  } as unknown as LessonDetailResponse;

  beforeEach(() => {
    vi.clearAllMocks();
    // Spy on console.error to suppress intentional error logs during tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does not initiate any API call if lessonId is an empty string', () => {
    const { result } = renderHook(() => useBlockLessons({ lessonId: '' }));

    expect(fetchLessonById).not.toHaveBeenCalled();
    expect(result.current.currentLesson).toBeNull();
  });

  it('fetches lesson data successfully on mount when lessonId is provided', async () => {
    vi.mocked(fetchLessonById).mockResolvedValueOnce(mockLessonData);

    const { result } = renderHook(() =>
      useBlockLessons({ lessonId: 'lesson-123' })
    );

    // Initially null before the side-effect promise resolves
    expect(result.current.currentLesson).toBeNull();

    await waitFor(() => {
      expect(result.current.currentLesson).toEqual(mockLessonData);
    });

    expect(fetchLessonById).toHaveBeenCalledOnce();
    expect(fetchLessonById).toHaveBeenCalledWith('lesson-123');
  });

  it('handles API fetch error gracefully on mount by logging and setting state to null', async () => {
    const mockError = new Error('Database connection failed');
    vi.mocked(fetchLessonById).mockRejectedValueOnce(mockError);

    const { result } = renderHook(() =>
      useBlockLessons({ lessonId: 'lesson-123' })
    );

    await waitFor(() => {
      expect(result.current.currentLesson).toBeNull();
    });

    expect(console.error).toHaveBeenCalledWith('Lỗi:', mockError);
  });

  it('re-runs the fetch lifecycle when the lessonId dependency changes', async () => {
    vi.mocked(fetchLessonById)
      .mockResolvedValueOnce(mockLessonData)
      .mockResolvedValueOnce({
        ...mockLessonData,
        _id: 'lesson-456',
        title: 'Pointers & References',
      });

    const { result, rerender } = renderHook(
      ({ lessonId }) => useBlockLessons({ lessonId }),
      { initialProps: { lessonId: 'lesson-123' } }
    );

    await waitFor(() => {
      expect(result.current.currentLesson).toEqual(mockLessonData);
    });

    // Rerender hook with a completely different lesson ID
    rerender({ lessonId: 'lesson-456' });

    await waitFor(() => {
      expect(result.current.currentLesson).toEqual({
        ...mockLessonData,
        _id: 'lesson-456',
        title: 'Pointers & References',
      });
    });

    expect(fetchLessonById).toHaveBeenCalledTimes(2);
    expect(fetchLessonById).toHaveBeenNthCalledWith(1, 'lesson-123');
    expect(fetchLessonById).toHaveBeenNthCalledWith(2, 'lesson-456');
  });

  it('manually updates currentLesson data when refetchLesson is executed', async () => {
    vi.mocked(fetchLessonById)
      .mockResolvedValueOnce(mockLessonData)
      .mockResolvedValueOnce({
        ...mockLessonData,
        title: 'Updated Introduction to C++',
      });

    const { result } = renderHook(() =>
      useBlockLessons({ lessonId: 'lesson-123' })
    );

    await waitFor(() => {
      expect(result.current.currentLesson).toEqual(mockLessonData);
    });

    // Invoke manual refetch routine inside an act block
    await act(async () => {
      await result.current.refetchLesson();
    });

    expect(result.current.currentLesson).toEqual({
      ...mockLessonData,
      title: 'Updated Introduction to C++',
    });
    expect(fetchLessonById).toHaveBeenCalledTimes(2);
  });

  it('handles API failure gracefully and drops data state to null when refetchLesson throws', async () => {
    vi.mocked(fetchLessonById).mockResolvedValueOnce(mockLessonData);

    const { result } = renderHook(() =>
      useBlockLessons({ lessonId: 'lesson-123' })
    );

    await waitFor(() => {
      expect(result.current.currentLesson).toEqual(mockLessonData);
    });

    const mockError = new Error('Timeout error');
    vi.mocked(fetchLessonById).mockRejectedValueOnce(mockError);

    await act(async () => {
      await result.current.refetchLesson();
    });

    expect(result.current.currentLesson).toBeNull();
    expect(console.error).toHaveBeenCalledWith('Lỗi:', mockError);
  });
});
