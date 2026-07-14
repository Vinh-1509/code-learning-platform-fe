import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { server } from '../../mocks/server';
import { createQueryWrapper } from '../../helpers/queryWrapper';
import { useBlockExercises } from '@/features/lesson/hooks/useBlockExercises';
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
    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(
      () => useBlockExercises({ block: undefined }),
      { wrapper }
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

    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useBlockExercises({ block }), {
      wrapper,
    });

    expect(result.current.exercises).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.blockCompleted).toBe(true);
  });

  it('fetches multiple exercises in parallel and populates the exercises array', async () => {
    server.use(
      http.get('*/api/practice/exercises/:exerciseId', ({ params }) =>
        HttpResponse.json({
          _id: String(params.exerciseId),
          type: 'fill_blank',
          title: 'Sample Exercise',
          instruction: 'Fill in the blank.',
          language: 'C++',
          level: 'easy',
          order: 1,
          data: {
            template: ['int ', ' = 0;'],
            placeholders: { input_1: 'x' },
          },
          hints: {},
        })
      )
    );

    const block = createMockBlock('block-2', [
      { type: 'practice', data: { order: 1, exerciseId: 'ex-1' } },
      { type: 'practice', data: { order: 2, exerciseId: 'ex-2' } },
    ]);

    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useBlockExercises({ block }), {
      wrapper,
    });

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.exercises).toHaveLength(2);
    expect(result.current.exercises.map((e) => e.id).sort()).toEqual([
      'ex-1',
      'ex-2',
    ]);
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

    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useBlockExercises({ block }), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.exercises).toEqual([]);
  });

  it('sets blockCompleted=true when all required exercises are passed', async () => {
    server.use(
      http.get('*/api/practice/exercises/:exerciseId', ({ params }) =>
        HttpResponse.json({
          _id: String(params.exerciseId),
          type: 'fill_blank',
          title: 'Sample Exercise',
          instruction: 'Fill in the blank.',
          language: 'C++',
          level: 'easy',
          order: 1,
          data: {
            template: ['int ', ' = 0;'],
            placeholders: { input_1: 'x' },
          },
          hints: {},
        })
      ),
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

    const block = createMockBlock('block-req', [
      { type: 'practice', data: { order: 1, exerciseId: 'ex-1' } },
    ]);

    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useBlockExercises({ block }), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.submitAnswer('ex-1', 'test answer');
    });

    expect(result.current.exercisePassMap['ex-1']).toBe(true);
    expect(result.current.blockCompleted).toBe(true);
  });

  it('keeps blockCompleted=false if only a non-required exercise is passed', async () => {
    server.use(
      http.get('*/api/practice/exercises/:exerciseId', ({ params }) =>
        HttpResponse.json({
          _id: String(params.exerciseId),
          type: 'fill_blank',
          title: 'Sample Exercise',
          instruction: 'Fill in the blank.',
          language: 'C++',
          level: 'easy',
          order: 1,
          data: {
            template: ['int ', ' = 0;'],
            placeholders: { input_1: 'x' },
          },
          hints: {},
        })
      ),
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

    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useBlockExercises({ block }), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.submitAnswer('ex-opt', 'test answer');
    });

    expect(result.current.exercisePassMap['ex-opt']).toBe(true);
    expect(result.current.blockCompleted).toBe(false);
  });

  it('does not set blockCompleted or passMap when submitAnswer is incorrect', async () => {
    server.use(
      http.get('*/api/practice/exercises/:exerciseId', ({ params }) =>
        HttpResponse.json({
          _id: String(params.exerciseId),
          type: 'fill_blank',
          title: 'Sample Exercise',
          instruction: 'Fill in the blank.',
          language: 'C++',
          level: 'easy',
          order: 1,
          data: {
            template: ['int ', ' = 0;'],
            placeholders: { input_1: 'x' },
          },
          hints: {},
        })
      ),
      http.post('*/api/practice/exercises/:exerciseId/submit', () =>
        HttpResponse.json({
          correct: false,
          items: [],
          attemptNumber: 1,
          prizeType: 'no prize',
          amount: 0,
          currentCoin: 100,
          hasAttackSlot: false,
        })
      )
    );

    const block = createMockBlock('block-fail', [
      { type: 'practice', data: { order: 1, exerciseId: 'ex-1' } },
    ]);

    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useBlockExercises({ block }), {
      wrapper,
    });

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
    server.use(
      http.get('*/api/practice/exercises/:exerciseId', ({ params }) =>
        HttpResponse.json({
          _id: String(params.exerciseId),
          type: 'fill_blank',
          title: 'Sample Exercise',
          instruction: 'Fill in the blank.',
          language: 'C++',
          level: 'easy',
          order: 1,
          data: {
            template: ['int ', ' = 0;'],
            placeholders: { input_1: 'x' },
          },
          hints: {},
        })
      ),
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

    const blockA = createMockBlock('block-A', [
      { type: 'practice', data: { order: 1, exerciseId: 'ex-A' } },
    ]);
    const blockB = createMockBlock('block-B', [
      { type: 'practice', data: { order: 1, exerciseId: 'ex-B' } },
    ]);

    const { wrapper } = createQueryWrapper();
    const { result, rerender } = renderHook(
      ({ block }: { block: Block }) => useBlockExercises({ block }),
      { initialProps: { block: blockA }, wrapper }
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.submitAnswer('ex-A', 'ans');
    });

    expect(result.current.blockCompleted).toBe(true);
    expect(result.current.exercisePassMap['ex-A']).toBe(true);

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
    server.use(
      http.post('*/api/practice/exercises/:exerciseId/hint', () =>
        HttpResponse.json({ hintLevel: 2, hint: 'Special test hint' })
      )
    );

    const block = createMockBlock('block-1');
    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useBlockExercises({ block }), {
      wrapper,
    });

    let hintRes;
    await act(async () => {
      hintRes = await result.current.getHint('ex-1', 2);
    });

    expect(hintRes).toEqual({ hintLevel: 2, hint: 'Special test hint' });
  });

  it('delegates explainAnswer() to the API handler and returns the response', async () => {
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

    const block = createMockBlock('block-1');
    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useBlockExercises({ block }), {
      wrapper,
    });

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
