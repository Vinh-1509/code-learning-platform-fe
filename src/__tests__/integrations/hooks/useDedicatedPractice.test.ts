import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';

// Mock the API calls
vi.mock('@/features/lesson/api/exercise.api', () => ({
  fetchExerciseById: vi.fn(),
  submitExerciseAnswer: vi.fn(),
  getExerciseHint: vi.fn(),
  explainExerciseAnswer: vi.fn(),
}));

// Mock the converter utility
vi.mock('@/components/practice_utils/utils/exercise.converter', () => ({
  convertExerciseResponse: vi.fn(),
}));

import { useDedicatedPractice } from '@/features/dedicated_practice/useDedicatedPractice';
import {
  fetchExerciseById,
  submitExerciseAnswer,
  getExerciseHint,
  explainExerciseAnswer,
} from '@/features/lesson/api/exercise.api';
import { convertExerciseResponse } from '@/components/practice_utils/utils/exercise.converter';
import type {
  ExerciseResponse,
  HintResponse,
  ExplainAnswerResponse,
} from '@/types/api/exercise.types';
import type { PracticeExercise } from '@/components/practice_utils/types/practiceTypes';

describe('useDedicatedPractice()', () => {
  const mockRawResponse = {
    _id: 'ex-123',
    type: 'code',
  } as unknown as ExerciseResponse;
  const mockConvertedExercise = {
    id: 'ex-123',
    type: 'code',
  } as unknown as PracticeExercise;

  beforeEach(() => {
    vi.clearAllMocks();
    // Spy on console.error to keep the test output clean during error handling tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('initializes with loading state set to true and null data', () => {
    // Return an unresolved hanging promise to freeze the hook in its mounting lifecycle phase
    vi.mocked(fetchExerciseById).mockReturnValueOnce(new Promise(() => {}));

    const { result } = renderHook(() => useDedicatedPractice('ex-123'));

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.exercise).toBeNull();
    expect(result.current.rawResponse).toBeNull();
    expect(result.current.lastSubmitCorrect).toBe(false);
  });

  it('fetches the exercise, converts it, and populates state on successful mount', async () => {
    vi.mocked(fetchExerciseById).mockResolvedValueOnce(mockRawResponse);
    vi.mocked(convertExerciseResponse).mockReturnValueOnce(
      mockConvertedExercise
    );

    const { result } = renderHook(() => useDedicatedPractice('ex-123'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(fetchExerciseById).toHaveBeenCalledWith('ex-123');
    expect(convertExerciseResponse).toHaveBeenCalledWith(mockRawResponse);

    expect(result.current.rawResponse).toEqual(mockRawResponse);
    expect(result.current.exercise).toEqual(mockConvertedExercise);
    expect(result.current.error).toBeNull();
  });

  it('catches API errors and sets the error state properly', async () => {
    const mockError = new Error('Database timeout');
    vi.mocked(fetchExerciseById).mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useDedicatedPractice('ex-123'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Database timeout');
    expect(result.current.exercise).toBeNull();
    expect(result.current.rawResponse).toBeNull();
  });

  it('refetches and resets state when the exerciseId dependency changes', async () => {
    vi.mocked(fetchExerciseById)
      .mockResolvedValueOnce(mockRawResponse)
      .mockResolvedValueOnce({
        _id: 'ex-999',
        type: 'quiz',
      } as unknown as ExerciseResponse);

    const { result, rerender } = renderHook(
      ({ id }) => useDedicatedPractice(id),
      { initialProps: { id: 'ex-123' } }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Change the ID prop to trigger the side effect routine again
    rerender({ id: 'ex-999' });

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(fetchExerciseById).toHaveBeenCalledTimes(2);
    expect(fetchExerciseById).toHaveBeenNthCalledWith(2, 'ex-999');
  });

  it('submits an answer, sets lastSubmitCorrect, and returns the API payload', async () => {
    const { result } = renderHook(() => useDedicatedPractice('ex-123'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    vi.mocked(submitExerciseAnswer).mockResolvedValueOnce({ correct: true });

    let submitRes;
    await act(async () => {
      submitRes = await result.current.submitAnswer('ex-123', 'int x = 5;');
    });

    expect(submitExerciseAnswer).toHaveBeenCalledWith('ex-123', 'int x = 5;');
    expect(submitRes).toEqual({ correct: true });
    expect(result.current.lastSubmitCorrect).toBe(true);
  });

  it('delegates getHint calls to the underlying API function', async () => {
    const { result } = renderHook(() => useDedicatedPractice('ex-123'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    vi.mocked(getExerciseHint).mockResolvedValueOnce({
      hint: 'Try using a pointer',
    } as unknown as HintResponse);

    let hintRes;
    await act(async () => {
      hintRes = await result.current.getHint('ex-123', 2);
    });

    expect(getExerciseHint).toHaveBeenCalledWith('ex-123', 2);
    expect(hintRes).toEqual({ hint: 'Try using a pointer' });
  });

  it('delegates explainAnswer calls to the underlying API function', async () => {
    const { result } = renderHook(() => useDedicatedPractice('ex-123'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    vi.mocked(explainExerciseAnswer).mockResolvedValueOnce({
      feedback: 'Almost there!',
    } as unknown as ExplainAnswerResponse);

    let explainRes;
    await act(async () => {
      explainRes = await result.current.explainAnswer(
        'ex-123',
        'double x = 5.0;'
      );
    });

    expect(explainExerciseAnswer).toHaveBeenCalledWith(
      'ex-123',
      'double x = 5.0;'
    );
    expect(explainRes).toEqual({ feedback: 'Almost there!' });
  });

  it('safely skips state updates if the component unmounts mid-fetch', () => {
    let resolveApi: (value: ExerciseResponse) => void = () => {};

    vi.mocked(fetchExerciseById).mockReturnValueOnce(
      new Promise<ExerciseResponse>((resolve) => {
        resolveApi = resolve;
      })
    );

    const { result, unmount } = renderHook(() =>
      useDedicatedPractice('ex-123')
    );

    expect(result.current.loading).toBe(true);

    // Unmount before the promise finishes processing
    unmount();

    // synchronous resolution trigger inside a synchronous act block
    act(() => {
      resolveApi(mockRawResponse);
    });

    // Guard ensures state values are preserved intact without calling state setters post-unmount
    expect(result.current.loading).toBe(true);
    expect(result.current.exercise).toBeNull();
  });
});
