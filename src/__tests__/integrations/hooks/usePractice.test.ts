import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { createQueryWrapper } from '../../helpers/queryWrapper';
import { server } from '../../mocks/server';

// useAuth is a context hook, not the thing under test here — keep it mocked
// so we can control `user.selectedLanguage` per test case.
const mockUseAuth = vi.fn();
vi.mock('@/features/auth/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

import { usePractice } from '@/features/practices/usePractice';

describe('usePractice()', () => {
  const mockFilters = {
    q: '',
    difficulty: 'All Levels',
    page: 1,
    limit: 10,
  };

  const exercisesPayload = {
    data: [
      { _id: 'ex-1', status: 'unlocked', tagId: ['pointers'], level: 'easy' },
      { _id: 'ex-2', status: 'unlocked', tagId: ['arrays'], level: 'medium' },
      { _id: 'ex-3', status: 'locked', tagId: ['loops'], level: 'hard' },
    ],
    total: 3,
    page: 1,
    limit: 10,
  };

  const weakTagsPayload = [{ _id: 'arrays', name: 'Arrays', failureRate: 0.8 }];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not fetch and exposes empty data when the user has no preferred language', async () => {
    mockUseAuth.mockReturnValue({ user: { selectedLanguage: [] } });

    let hitCount = 0;
    server.use(
      http.get('*/api/practice/exercises', () => {
        hitCount += 1;
        return HttpResponse.json(exercisesPayload);
      }),
      http.get('*/api/tags/weakness', () => HttpResponse.json(weakTagsPayload))
    );

    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => usePractice(mockFilters), { wrapper });

    // Real debounce: just wait past the 400ms window with real timers
    await new Promise((resolve) => setTimeout(resolve, 450));

    expect(hitCount).toBe(0);
    expect(result.current.exercises).toEqual([]);
    expect(result.current.featuredExercise).toBeNull();
  });

  it('fetches exercises and weakness tags, and flags the featured exercise correctly', async () => {
    mockUseAuth.mockReturnValue({ user: { selectedLanguage: ['C++'] } });

    server.use(
      http.get('*/api/practice/exercises', () =>
        HttpResponse.json(exercisesPayload)
      ),
      http.get('*/api/tags/weakness', () => HttpResponse.json(weakTagsPayload))
    );

    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => usePractice(mockFilters), { wrapper });

    // Real debounce: just wait past the 400ms window with real timers
    await new Promise((resolve) => setTimeout(resolve, 450));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.exercises.map((e) => e._id)).toEqual(
      expect.arrayContaining(['ex-1', 'ex-2'])
    );
    expect(result.current.weakTags).toEqual(weakTagsPayload);
    // ex-2 carries tagId "arrays", which matches the weak tag -> featured + flagged
    expect(result.current.featuredExercise?._id).toBe('ex-2');
    expect(result.current.isWeakRecommendation).toBe(true);
  });

  it('falls back to the first unlocked exercise when no weak tag overlap exists', async () => {
    mockUseAuth.mockReturnValue({ user: { selectedLanguage: ['C++'] } });

    server.use(
      http.get('*/api/practice/exercises', () =>
        HttpResponse.json(exercisesPayload)
      ),
      http.get('*/api/tags/weakness', () =>
        HttpResponse.json([
          { _id: 'recursion', name: 'Recursion', failureRate: 0.9 },
        ])
      )
    );

    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => usePractice(mockFilters), { wrapper });

    // Real debounce: just wait past the 400ms window with real timers
    await new Promise((resolve) => setTimeout(resolve, 450));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.featuredExercise?._id).toBe('ex-1');
    expect(result.current.isWeakRecommendation).toBe(false);
  });

  it('debounces filter changes and only sends the request for the final query value', async () => {
    mockUseAuth.mockReturnValue({ user: { selectedLanguage: ['Python'] } });

    const seenFilteredQueries: string[] = [];
    server.use(
      http.get('*/api/practice/exercises', ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get('limit') === '10') {
          seenFilteredQueries.push(url.searchParams.get('q') ?? '');
        }
        return HttpResponse.json(exercisesPayload);
      }),
      http.get('*/api/tags/weakness', () => HttpResponse.json(weakTagsPayload))
    );

    const { wrapper } = createQueryWrapper();
    const { rerender } = renderHook((filters) => usePractice(filters), {
      initialProps: mockFilters,
      wrapper,
    });

    await new Promise((resolve) => setTimeout(resolve, 200));
    rerender({ ...mockFilters, q: 'list' });

    await new Promise((resolve) => setTimeout(resolve, 200));
    rerender({ ...mockFilters, q: 'lists and tuples' });

    // Real debounce: just wait past the 400ms window with real timers
    await new Promise((resolve) => setTimeout(resolve, 450));

    await waitFor(() => {
      expect(seenFilteredQueries.length).toBeGreaterThan(0);
    });

    // Only the final debounced value should have produced a network call,
    // alongside the initial mount call with the empty starting q.
    expect(seenFilteredQueries).toEqual(['', 'lists and tuples']);
  });

  it('omits the difficulty param when the filter is "All Levels"', async () => {
    mockUseAuth.mockReturnValue({ user: { selectedLanguage: ['Go'] } });

    let capturedParams: URLSearchParams | null = null;
    server.use(
      http.get('*/api/practice/exercises', ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get('limit') === '10') {
          capturedParams = url.searchParams;
        }
        return HttpResponse.json({ data: [], total: 0, page: 1, limit: 10 });
      }),
      http.get('*/api/tags/weakness', () => HttpResponse.json([]))
    );

    const { wrapper } = createQueryWrapper();
    renderHook(
      () => usePractice({ ...mockFilters, difficulty: 'All Levels' }),
      { wrapper }
    );

    // Real debounce: just wait past the 400ms window with real timers
    await new Promise((resolve) => setTimeout(resolve, 450));

    await waitFor(() => {
      expect(capturedParams).not.toBeNull();
    });

    expect(capturedParams!.has('difficulty')).toBe(false);
    expect(capturedParams!.get('language')).toBe('Go');
  });

  it('lowercases the difficulty param when a specific level is selected', async () => {
    mockUseAuth.mockReturnValue({ user: { selectedLanguage: ['Java'] } });

    let capturedParams: URLSearchParams | null = null;
    server.use(
      http.get('*/api/practice/exercises', ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get('limit') === '10') {
          capturedParams = url.searchParams;
        }
        return HttpResponse.json({ data: [], total: 0, page: 1, limit: 10 });
      }),
      http.get('*/api/tags/weakness', () => HttpResponse.json([]))
    );

    const { wrapper } = createQueryWrapper();
    renderHook(() => usePractice({ ...mockFilters, difficulty: 'Hard' }), {
      wrapper,
    });

    // Real debounce: just wait past the 400ms window with real timers
    await new Promise((resolve) => setTimeout(resolve, 450));

    await waitFor(() => {
      expect(capturedParams).not.toBeNull();
    });

    expect(capturedParams!.get('difficulty')).toBe('hard');
  });

  it('surfaces a fallback error message and empty exercises when the request fails', async () => {
    mockUseAuth.mockReturnValue({ user: { selectedLanguage: ['C++'] } });

    server.use(
      http.get('*/api/practice/exercises', () => {
        return new HttpResponse(null, { status: 500 });
      }),
      http.get('*/api/tags/weakness', () => HttpResponse.json([]))
    );

    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => usePractice(mockFilters), { wrapper });

    // Real debounce: just wait past the 400ms window with real timers
    await new Promise((resolve) => setTimeout(resolve, 450));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // The migrated hook surfaces the real axios error message, not a
    // hardcoded fallback string (only used for non-Error rejections).
    expect(result.current.error).toBe('Request failed with status code 500');
    expect(result.current.exercises).toEqual([]);

    // Let the sibling weakness-tags query settle too, so no update fires
    // after the test (and its implicit act scope) has already finished.
    await waitFor(() => {
      expect(result.current.weakTags).toEqual([]);
    });
  });
});
