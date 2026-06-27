import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { server } from '../../mocks/server';
import { useBlockExercises } from '@/features/lesson/useBlockExercises';
import type { Block, ContentItem } from '@/types/api/learning.types';

// ── Mock Helpers ──

function createMockBlock(blockId: string, content: ContentItem[] = []): Block {
  return {
    _id: blockId,
    title: 'Test Block',
    status: 'active',
    isFeynmanPassed: false,
    feynmanQuestion: 'Explain this?',
    content,
  };
}

describe('useBlockExercises()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('yields empty state and stays loading=false when block is undefined', () => {
    const { result } = renderHook(() =>
      useBlockExercises({ block: undefined })
    );

    expect(result.current.exercises).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.blockCompleted).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('yields empty state and immediately sets blockCompleted=true when block has no practice items', () => {
    const block = createMockBlock('block-1', [
      { type: 'theory', data: { order: 1 } },
      { type: 'code', data: { order: 2 } },
    ]);

    const { result } = renderHook(() => useBlockExercises({ block }));

    expect(result.current.exercises).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.blockCompleted).toBe(true);
  });

  it('fetches multiple exercises in parallel and populates the exercises array', async () => {
    const block = createMockBlock('block-2', [
      { type: 'practice', data: { order: 1, exerciseId: 'ex-1' } },
      { type: 'practice', data: { order: 2, exerciseId: 'ex-2' } },
    ]);

    const { result } = renderHook(() => useBlockExercises({ block }));

    // Starts loading immediately
    expect(result.current.loading).toBe(true);

    // Wait for the async effect to finish fetching
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.exercises).toHaveLength(2);
    // Verified mapped by the exercise.converter
    expect(result.current.exercises[0].id).toBe('ex-1');
    expect(result.current.exercises[1].id).toBe('ex-2');
    expect(result.current.blockCompleted).toBe(false); // Gate remains closed
  });

  it('sets the error state if the API fetch throws', async () => {
    server.use(
      http.get('*/api/practice/exercises/:exerciseId', () =>
        HttpResponse.error()
      )
    );

    const block = createMockBlock('block-err', [
      { type: 'practice', data: { order: 1, exerciseId: 'ex-err' } },
    ]);

    const { result } = renderHook(() => useBlockExercises({ block }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Network Error');
    expect(result.current.exercises).toEqual([]);
  });

  it('sets blockCompleted=true when all required exercises are passed', async () => {
    const block = createMockBlock('block-req', [
      { type: 'practice', data: { order: 1, exerciseId: 'ex-1' } },
    ]);

    const { result } = renderHook(() => useBlockExercises({ block }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Default MSW handler for /submit returns { correct: true }
    await act(async () => {
      await result.current.submitAnswer('ex-1', 'test answer');
    });

    expect(result.current.exercisePassMap['ex-1']).toBe(true);
    expect(result.current.blockCompleted).toBe(true);
  });

  it('keeps blockCompleted=false if only a non-required exercise is passed', async () => {
    const block = createMockBlock('block-mixed', [
      {
        type: 'practice',
        data: { order: 1, exerciseId: 'ex-req', required: true },
      },
      {
        type: 'practice',
        data: { order: 2, exerciseId: 'ex-opt', required: false },
      },
    ]);

    const { result } = renderHook(() => useBlockExercises({ block }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // User completes only the optional exercise
    await act(async () => {
      await result.current.submitAnswer('ex-opt', 'test answer');
    });

    expect(result.current.exercisePassMap['ex-opt']).toBe(true);
    // Gate is still closed because ex-req is not passed
    expect(result.current.blockCompleted).toBe(false);
  });

  it('does not set blockCompleted or passMap when submitAnswer is incorrect', async () => {
    server.use(
      http.post('*/api/practice/exercises/:exerciseId/submit', () =>
        HttpResponse.json({ correct: false })
      )
    );

    const block = createMockBlock('block-fail', [
      { type: 'practice', data: { order: 1, exerciseId: 'ex-1' } },
    ]);

    const { result } = renderHook(() => useBlockExercises({ block }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.submitAnswer('ex-1', 'bad answer');
    });

    expect(result.current.exercisePassMap['ex-1']).toBeUndefined();
    expect(result.current.blockCompleted).toBe(false);
  });

  it('resets state completely when the blockId changes', async () => {
    const blockA = createMockBlock('block-A', [
      { type: 'practice', data: { order: 1, exerciseId: 'ex-A' } },
    ]);
    const blockB = createMockBlock('block-B', [
      { type: 'practice', data: { order: 1, exerciseId: 'ex-B' } },
    ]);

    const { result, rerender } = renderHook(
      ({ block }) => useBlockExercises({ block }),
      { initialProps: { block: blockA } }
    );

    // Pass the first block's exercise
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.submitAnswer('ex-A', 'ans');
    });

    expect(result.current.blockCompleted).toBe(true);
    expect(result.current.exercisePassMap['ex-A']).toBe(true);

    // Rerender with a new block
    rerender({ block: blockB });

    await waitFor(() => {
      expect(result.current.exercisePassMap).toEqual({});
      expect(result.current.blockCompleted).toBe(false);
    });

    await waitFor(() => {
      expect(result.current.exercises).toHaveLength(1); // block-B exercises loaded
    });
  });

  it('delegates getHint() to the API handler and returns the response', async () => {
    const block = createMockBlock('block-1');
    const { result } = renderHook(() => useBlockExercises({ block }));

    // Mock an explicit response structure just for this test
    server.use(
      http.post('*/api/practice/exercises/:exerciseId/hint', () =>
        HttpResponse.json({ hintLevel: 2, hint: 'Special test hint' })
      )
    );

    let hintRes;
    await act(async () => {
      hintRes = await result.current.getHint('ex-1', 2);
    });

    expect(hintRes).toEqual({ hintLevel: 2, hint: 'Special test hint' });
  });

  it('delegates explainAnswer() to the API handler and returns the response', async () => {
    const block = createMockBlock('block-1');
    const { result } = renderHook(() => useBlockExercises({ block }));

    server.use(
      http.post('*/api/exercises/:exerciseId/explain', () =>
        HttpResponse.json({
          exerciseId: 'ex-1',
          isCorrect: false,
          feedback: 'AI says you missed a semicolon.',
          items: [],
        })
      )
    );

    let explainRes;
    await act(async () => {
      explainRes = await result.current.explainAnswer('ex-1', 'bad code');
    });

    expect(explainRes).toEqual({
      exerciseId: 'ex-1',
      isCorrect: false,
      feedback: 'AI says you missed a semicolon.',
      items: [],
    });
  });
});
