import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { useBlockLessons } from '@/features/lesson/hooks/useBlockLessons';
import { server } from '../../mocks/server';
import { createQueryWrapper } from '../../helpers/queryWrapper';

describe('useBlockLessons()', () => {
  beforeEach(() => {
    // Reset any per-test handler overrides set via server.use()
    server.resetHandlers();
  });

  it('does not initiate any API call if lessonId is an empty string', () => {
    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useBlockLessons({ lessonId: '' }), {
      wrapper,
    });

    // `enabled: false` -> query never fires, data stays undefined/null
    expect(result.current.currentLesson).toBeNull();
  });

  it('fetches lesson data successfully on mount when lessonId is provided', async () => {
    server.use(
      http.get('*/api/learning/lessons/:lessonId', ({ params }) => {
        return HttpResponse.json({
          _id: String(params.lessonId),
          title: 'Introduction to C++',
          order: 1,
          blocks: [],
          progress: {
            completionPercentage: 0,
            isCompleted: false,
          },
        });
      })
    );

    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(
      () => useBlockLessons({ lessonId: 'lesson-123' }),
      { wrapper }
    );

    expect(result.current.currentLesson).toBeNull();

    await waitFor(() => {
      expect(result.current.currentLesson).not.toBeNull();
    });

    expect(result.current.currentLesson).toEqual({
      _id: 'lesson-123',
      title: 'Introduction to C++',
      order: 1,
      blocks: [],
      progress: {
        completionPercentage: 0,
        isCompleted: false,
      },
    });
  });

  it('keeps currentLesson null when the API call fails', async () => {
    server.use(
      http.get('*/api/learning/lessons/:lessonId', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(
      () => useBlockLessons({ lessonId: 'lesson-123' }),
      { wrapper }
    );

    await waitFor(() => {
      // useQuery surfaces failure via isError, not by throwing/logging itself
      expect(result.current.currentLesson).toBeNull();
    });
  });

  it('re-runs the fetch lifecycle when the lessonId dependency changes', async () => {
    server.use(
      http.get('*/api/learning/lessons/:lessonId', ({ params }) => {
        const id = String(params.lessonId);
        return HttpResponse.json({
          _id: id,
          title:
            id === 'lesson-123'
              ? 'Introduction to C++'
              : 'Pointers & References',
          order: 1,
          blocks: [],
          progress: {
            completionPercentage: 0,
            isCompleted: false,
          },
        });
      })
    );

    const { wrapper } = createQueryWrapper();
    const { result, rerender } = renderHook(
      ({ lessonId }: { lessonId: string }) => useBlockLessons({ lessonId }),
      { initialProps: { lessonId: 'lesson-123' }, wrapper }
    );

    await waitFor(() => {
      expect(result.current.currentLesson?.title).toBe('Introduction to C++');
    });

    rerender({ lessonId: 'lesson-456' });

    await waitFor(() => {
      expect(result.current.currentLesson?.title).toBe('Pointers & References');
    });

    expect(result.current.currentLesson?._id).toBe('lesson-456');
  });

  it('manually updates currentLesson data when refetchLesson is executed', async () => {
    let callCount = 0;
    server.use(
      http.get('*/api/learning/lessons/:lessonId', () => {
        callCount += 1;
        return HttpResponse.json({
          _id: 'lesson-123',
          title:
            callCount === 1
              ? 'Introduction to C++'
              : 'Updated Introduction to C++',
          order: 1,
          blocks: [],
          progress: {
            completionPercentage: 0,
            isCompleted: false,
          },
        });
      })
    );

    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(
      () => useBlockLessons({ lessonId: 'lesson-123' }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.currentLesson?.title).toBe('Introduction to C++');
    });

    await act(async () => {
      await result.current.refetchLesson();
    });

    await waitFor(() => {
      expect(result.current.currentLesson?.title).toBe(
        'Updated Introduction to C++'
      );
    });

    expect(callCount).toBe(2);
  });
});
