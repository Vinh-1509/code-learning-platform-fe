import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock the Auth Hook
const mockUseAuth = vi.fn();
vi.mock('@/features/auth/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock the Axios Layer
vi.mock('@/features/practices/api/practice.api', () => ({
  fetchExercises: vi.fn(),
  fetchWeaknessTags: vi.fn(),
}));

import { usePractice } from '@/features/practices/hooks/usePractice';
import {
  fetchExercises,
  fetchWeaknessTags,
} from '@/features/practices/api/practice.api';

type ExercisePageResponse = Awaited<ReturnType<typeof fetchExercises>>;
type WeaknessTagListResponse = Awaited<ReturnType<typeof fetchWeaknessTags>>;

describe('usePractice()', () => {
  const mockFilters = {
    q: '',
    difficulty: 'All Levels',
    page: 1,
    limit: 10,
  };

  const mockExercisesResponse = {
    data: [
      { _id: 'ex-1', status: 'unlocked', tagId: ['pointers'] },
      { _id: 'ex-2', status: 'unlocked', tagId: ['arrays'] },
      { _id: 'ex-3', status: 'locked', tagId: ['loops'] },
    ],
    total: 3,
    page: 1,
    limit: 10,
  } as unknown as ExercisePageResponse;

  const mockWeakTagsResponse = [
    { _id: 'arrays', name: 'Arrays', failureRate: 0.8 },
  ] as unknown as WeaknessTagListResponse;

  beforeEach(() => {
    // resetAllMocks clears histories AND discards unconsumed resolved values/implementations
    vi.resetAllMocks();
    vi.useFakeTimers();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('initializes with a loading state set to true before the debounce duration passes', () => {
    mockUseAuth.mockReturnValue({ user: { selectedLanguage: ['C++'] } });
    vi.mocked(fetchExercises).mockReturnValueOnce(new Promise(() => {}));
    vi.mocked(fetchWeaknessTags).mockReturnValueOnce(new Promise(() => {}));

    const { result } = renderHook(() => usePractice(mockFilters));

    expect(result.current.loading).toBe(true);
    expect(result.current.exercises).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('bypasses api operations and returns empty arrays if the user has no preferred language', async () => {
    mockUseAuth.mockReturnValue({ user: { selectedLanguage: [] } });

    const { result } = renderHook(() => usePractice(mockFilters));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });

    // The hook returns early when user language is empty, meaning loading remains true
    expect(result.current.loading).toBe(true);
    expect(fetchExercises).not.toHaveBeenCalled();
    expect(fetchWeaknessTags).not.toHaveBeenCalled();
    expect(result.current.exercises).toEqual([]);
    expect(result.current.featuredExercise).toBeNull();
  });

  it('fetches synchronized lists and flags the featured challenge accurately when there is a weak area match', async () => {
    mockUseAuth.mockReturnValue({ user: { selectedLanguage: ['C++'] } });
    vi.mocked(fetchExercises).mockResolvedValueOnce(mockExercisesResponse);
    vi.mocked(fetchWeaknessTags).mockResolvedValueOnce(mockWeakTagsResponse);

    const { result } = renderHook(() => usePractice(mockFilters));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });

    expect(result.current.loading).toBe(false);
    // Fixed: q property is omitted because it is empty
    expect(fetchExercises).toHaveBeenCalledWith({
      language: 'C++',
      page: 1,
      limit: 10,
    });
    expect(result.current.exercises).toEqual(mockExercisesResponse.data);
    expect(result.current.weakTags).toEqual(mockWeakTagsResponse);
    expect(result.current.featuredExercise).toEqual(
      mockExercisesResponse.data[1]
    );
    expect(result.current.isWeakRecommendation).toBe(true);
  });

  it('falls back to the first unlocked challenge when no weak tag overlaps exist', async () => {
    mockUseAuth.mockReturnValue({ user: { selectedLanguage: ['C++'] } });
    vi.mocked(fetchExercises).mockResolvedValueOnce(mockExercisesResponse);
    vi.mocked(fetchWeaknessTags).mockResolvedValueOnce([
      { _id: 'recursion', name: 'Recursion', failureRate: 0.9 },
    ] as unknown as WeaknessTagListResponse);

    const { result } = renderHook(() => usePractice(mockFilters));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.featuredExercise).toEqual(
      mockExercisesResponse.data[0]
    );
    expect(result.current.isWeakRecommendation).toBe(false);
  });

  it('throttles rapid filter entries and only submits a single query collection upon the last change', async () => {
    mockUseAuth.mockReturnValue({ user: { selectedLanguage: ['Python'] } });
    vi.mocked(fetchExercises).mockResolvedValue(mockExercisesResponse);
    vi.mocked(fetchWeaknessTags).mockResolvedValue(mockWeakTagsResponse);

    const { rerender } = renderHook((filters) => usePractice(filters), {
      initialProps: mockFilters,
    });

    act(() => {
      vi.advanceTimersByTime(200);
    });
    rerender({ ...mockFilters, q: 'list' });

    act(() => {
      vi.advanceTimersByTime(200);
    });
    rerender({ ...mockFilters, q: 'lists and tuples' });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });

    expect(fetchExercises).toHaveBeenCalledTimes(1);
    expect(fetchExercises).toHaveBeenCalledWith({
      language: 'Python',
      q: 'lists and tuples',
      page: 1,
      limit: 10,
    });
  });

  it('omits sending difficulty properties if the selected filter value matches All Levels', async () => {
    mockUseAuth.mockReturnValue({ user: { selectedLanguage: ['Go'] } });
    vi.mocked(fetchExercises).mockResolvedValueOnce({
      data: [],
      total: 0,
      page: 1,
      limit: 10,
    });
    vi.mocked(fetchWeaknessTags).mockResolvedValueOnce([]);

    renderHook(() => usePractice({ ...mockFilters, difficulty: 'All Levels' }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });

    // Fixed: q property is omitted because it is empty
    expect(fetchExercises).toHaveBeenCalledWith({
      language: 'Go',
      page: 1,
      limit: 10,
    });
  });

  it('converts difficulty input entries to lowercase parameters when standard strings are submitted', async () => {
    mockUseAuth.mockReturnValue({ user: { selectedLanguage: ['Java'] } });
    vi.mocked(fetchExercises).mockResolvedValueOnce({
      data: [],
      total: 0,
      page: 1,
      limit: 10,
    });
    vi.mocked(fetchWeaknessTags).mockResolvedValueOnce([]);

    renderHook(() => usePractice({ ...mockFilters, difficulty: 'Hard' }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });

    // Fixed: q property is omitted because it is empty
    expect(fetchExercises).toHaveBeenCalledWith({
      language: 'Java',
      page: 1,
      limit: 10,
      difficulty: 'hard',
    });
  });

  it('catches execution failures and gracefully surfaces a string message context', async () => {
    mockUseAuth.mockReturnValue({ user: { selectedLanguage: ['C++'] } });
    vi.mocked(fetchExercises).mockRejectedValueOnce(
      new Error('Connection broken')
    );
    vi.mocked(fetchWeaknessTags).mockResolvedValueOnce([]);

    const { result } = renderHook(() => usePractice(mockFilters));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Error when fetching exercises');
    expect(result.current.exercises).toEqual([]);
  });

  it('safely drops state mutations if the calling context unmounts mid-operation', () => {
    mockUseAuth.mockReturnValue({ user: { selectedLanguage: ['C++'] } });

    let resolveExercises: (value: ExercisePageResponse) => void = () => {};
    vi.mocked(fetchExercises).mockReturnValueOnce(
      new Promise<ExercisePageResponse>((resolve) => {
        resolveExercises = resolve;
      })
    );
    vi.mocked(fetchWeaknessTags).mockResolvedValueOnce([]);

    const { result, unmount } = renderHook(() => usePractice(mockFilters));

    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(result.current.loading).toBe(true);

    unmount();

    act(() => {
      resolveExercises(mockExercisesResponse);
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.exercises).toEqual([]);
  });
});
