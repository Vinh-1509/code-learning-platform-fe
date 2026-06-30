import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { useDedicatedPractice } from '@/features/dedicated_practice/hooks/useDedicatedPractice';
import { server } from '../../mocks/server';
import { createQueryWrapper } from '../../helpers/queryWrapper';

// Pure data-mapping utility — not network-driven, fine to mock directly so
// we can assert it receives the raw API response unchanged.
vi.mock('@/components/practice_utils/utils/exercise.converter', () => ({
  convertExerciseResponse: vi.fn((raw) => ({ id: raw._id, type: raw.type })),
}));

import { convertExerciseResponse } from '@/components/practice_utils/utils/exercise.converter';

describe('useDedicatedPractice()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches the exercise, converts it, and populates state on successful mount', async () => {
    server.use(
      http.get('*/api/practice/exercises/:exerciseId', ({ params }) => {
        return HttpResponse.json({
          _id: String(params.exerciseId),
          type: 'code',
        });
      })
    );

    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useDedicatedPractice('ex-123'), {
      wrapper,
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.exercise).toBeNull();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.rawResponse).toEqual({
      _id: 'ex-123',
      type: 'code',
    });
    expect(convertExerciseResponse).toHaveBeenCalledWith({
      _id: 'ex-123',
      type: 'code',
    });
    expect(result.current.exercise).toEqual({ id: 'ex-123', type: 'code' });
    expect(result.current.error).toBeNull();
  });

  it('surfaces the API error message and keeps exercise data null on failure', async () => {
    server.use(
      http.get('*/api/practice/exercises/:exerciseId', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useDedicatedPractice('ex-123'), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Request failed with status code 500');
    expect(result.current.exercise).toBeNull();
    expect(result.current.rawResponse).toBeNull();
  });

  it('refetches and resets lastSubmitCorrect when the exerciseId changes', async () => {
    server.use(
      http.get('*/api/practice/exercises/:exerciseId', ({ params }) => {
        return HttpResponse.json({
          _id: String(params.exerciseId),
          type: String(params.exerciseId) === 'ex-123' ? 'code' : 'quiz',
        });
      }),
      http.post('*/api/practice/exercises/:exerciseId/submit', () =>
        HttpResponse.json({ correct: true, items: [], attemptNumber: 1 })
      )
    );

    const { wrapper } = createQueryWrapper();
    const { result, rerender } = renderHook(
      ({ id }: { id: string }) => useDedicatedPractice(id),
      { initialProps: { id: 'ex-123' }, wrapper }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Submit so lastSubmitCorrect flips true before switching exercises
    await act(async () => {
      await result.current.submitAnswer('ex-123', 'int x = 5;');
    });
    expect(result.current.lastSubmitCorrect).toBe(true);

    rerender({ id: 'ex-999' });

    // Submitting flag resets immediately when the exercise id changes
    expect(result.current.lastSubmitCorrect).toBe(false);

    await waitFor(() => {
      expect(result.current.rawResponse?._id).toBe('ex-999');
    });
    expect(result.current.rawResponse?.type).toBe('quiz');
  });

  it('submits an answer and updates lastSubmitCorrect from the API response', async () => {
    server.use(
      http.post('*/api/practice/exercises/:exerciseId/submit', () =>
        HttpResponse.json({ correct: true, items: [], attemptNumber: 1 })
      )
    );

    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useDedicatedPractice('ex-123'), {
      wrapper,
    });
    await waitFor(() => expect(result.current.loading).toBe(false));

    let submitRes;
    await act(async () => {
      submitRes = await result.current.submitAnswer('ex-123', 'int x = 5;');
    });

    expect(submitRes).toEqual({
      correct: true,
      items: [],
      attemptNumber: 1,
    });
    expect(result.current.lastSubmitCorrect).toBe(true);
  });

  it('delegates getHint calls and returns the API payload', async () => {
    server.use(
      http.post('*/api/practice/exercises/:exerciseId/hint', () =>
        HttpResponse.json({ hintLevel: 2, hint: 'Try using a pointer' })
      )
    );

    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useDedicatedPractice('ex-123'), {
      wrapper,
    });
    await waitFor(() => expect(result.current.loading).toBe(false));

    let hintRes;
    await act(async () => {
      hintRes = await result.current.getHint('ex-123', 2);
    });

    expect(hintRes).toEqual({ hintLevel: 2, hint: 'Try using a pointer' });
  });

  it('delegates explainAnswer calls and returns the API payload', async () => {
    server.use(
      http.post('*/api/exercises/:exerciseId/explain', () =>
        HttpResponse.json({
          exerciseId: 'ex-123',
          isCorrect: false,
          feedback: 'Almost there!',
          items: [],
          suggestion: 'Double check the variable type.',
        })
      )
    );

    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useDedicatedPractice('ex-123'), {
      wrapper,
    });
    await waitFor(() => expect(result.current.loading).toBe(false));

    let explainRes;
    await act(async () => {
      explainRes = await result.current.explainAnswer(
        'ex-123',
        'double x = 5.0;'
      );
    });

    expect(explainRes).toEqual(
      expect.objectContaining({ feedback: 'Almost there!' })
    );
  });

  it('does not fetch when exerciseId is an empty string', () => {
    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useDedicatedPractice(''), {
      wrapper,
    });

    // `enabled: false` -> query never fires, loading reflects idle state
    expect(result.current.exercise).toBeNull();
    expect(result.current.rawResponse).toBeNull();
  });
});
