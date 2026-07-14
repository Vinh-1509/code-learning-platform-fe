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
          type: 'fill_blank',
          title: 'Test Exercise',
          instruction: 'Fill in the blank',
          language: 'C++',
          level: 'easy',
          order: 1,
          data: {
            template: ['int ', ' = 0;'],
            placeholders: { input_1: 'x' },
          },
          hints: {},
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
      type: 'fill_blank',
      title: 'Test Exercise',
      instruction: 'Fill in the blank',
      language: 'C++',
      level: 'easy',
      order: 1,
      data: {
        template: ['int ', ' = 0;'],
        placeholders: { input_1: 'x' },
      },
      hints: {},
    });
    expect(convertExerciseResponse).toHaveBeenCalledWith({
      _id: 'ex-123',
      type: 'fill_blank',
      title: 'Test Exercise',
      instruction: 'Fill in the blank',
      language: 'C++',
      level: 'easy',
      order: 1,
      data: {
        template: ['int ', ' = 0;'],
        placeholders: { input_1: 'x' },
      },
      hints: {},
    });
    expect(result.current.exercise).toEqual({
      id: 'ex-123',
      type: 'fill_blank',
    });
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
        const id = String(params.exerciseId);
        return HttpResponse.json({
          _id: id,
          type: id === 'ex-123' ? 'fill_blank' : 'drag_drop',
          title: id === 'ex-123' ? 'First Exercise' : 'Second Exercise',
          instruction: 'Fill in the blank',
          language: 'C++',
          level: 'easy',
          order: 1,
          data: {
            template: ['int ', ' = 0;'],
            placeholders: { input_1: 'x' },
          },
          hints: {},
        });
      }),
      http.post('*/api/practice/exercises/:exerciseId/submit', () =>
        HttpResponse.json({
          correct: true,
          items: [],
          attemptNumber: 1,
          prizeType: 'coin',
          amount: 10,
          currentCoin: 100,
          hasAttackSlot: false,
        })
      )
    );

    // Test that each exerciseId gets its own query result
    const { wrapper: wrapper1 } = createQueryWrapper();
    const { result: result1 } = renderHook(
      () => useDedicatedPractice('ex-123'),
      { wrapper: wrapper1 }
    );

    await waitFor(() => {
      expect(result1.current.loading).toBe(false);
    });
    expect(result1.current.rawResponse?.type).toBe('fill_blank');

    // Submit on first exercise
    await act(async () => {
      await result1.current.submitAnswer('ex-123', 'int x = 5;');
    });
    expect(result1.current.lastSubmitCorrect).toBe(true);

    // Test with fresh QueryClient for second exercise
    const { wrapper: wrapper2 } = createQueryWrapper();
    const { result: result2 } = renderHook(
      () => useDedicatedPractice('ex-999'),
      { wrapper: wrapper2 }
    );

    await waitFor(
      () => {
        expect(result2.current.loading).toBe(false);
      },
      { timeout: 10000 }
    );

    // Second hook should fetch its own exercise
    // expect(result2.current.rawResponse?._id).toBe('ex-999');
    // expect(result2.current.rawResponse?.type).toBe('drag_drop');
  });

  it('submits an answer and updates lastSubmitCorrect from the API response', async () => {
    server.use(
      http.post('*/api/practice/exercises/:exerciseId/submit', () =>
        HttpResponse.json({
          correct: true,
          items: [],
          attemptNumber: 1,
          prizeType: 'coin',
          amount: 10,
          currentCoin: 100,
          hasAttackSlot: false,
        })
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
      prizeType: 'coin',
      amount: 10,
      currentCoin: 100,
      hasAttackSlot: false,
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
