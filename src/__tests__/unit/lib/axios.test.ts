import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { http, HttpResponse } from 'msw';

import { server } from '../../mocks/server';

import { loginUser, registerUser, getMe } from '@/features/auth/api/auth.api';
import {
  fetchLanguages,
  saveLanguage,
} from '@/features/language_selection/api/languages.api';
import { fetchLessonById } from '@/features/lesson/api/lesson.api';
import {
  fetchExerciseById,
  submitExerciseAnswer,
  getExerciseHint,
  getExerciseHistory,
  explainExerciseAnswer,
} from '@/features/lesson/api/exercise.api';
import {
  fetchWeaknessTags,
  fetchExercises,
} from '@/features/practices/api/practice.api';
import {
  fetchMilestones,
  fetchLessonsByMilestone,
  fetchDashboardData,
} from '@/features/dashboard/api/dashboard.api';
import type { LanguageOption } from '@/types/languageSelection';

describe('axios.ts — auth wrapper functions', () => {
  it('loginUser posts credentials and returns the access token', async () => {
    const result = await loginUser({
      email: 'test@hcmut.edu.vn',
      password: '123456',
    });

    expect(result.access_token).toBe('fake-jwt');
  });

  it('registerUser posts the payload and returns the access token', async () => {
    const result = await registerUser({
      email: 'new@hcmut.edu.vn',
      password: '12345678',
    });

    expect(result.access_token).toBe('fake-jwt-register');
  });

  it('getMe returns the current user profile', async () => {
    const result = await getMe();

    expect(result._id).toBe('user-1');
    expect(result.selectedLanguage).toEqual(['C++']);
  });
});

describe('axios.ts — language selection wrapper functions', () => {
  it('fetchLanguages transforms the raw API shape into LanguageOption[]', async () => {
    const result = await fetchLanguages();

    expect(result).toHaveLength(2);

    const cpp = result.find((item: LanguageOption) => item.language === 'C++');
    expect(cpp).toBeDefined();
    expect(cpp).toMatchObject({
      id: 'lang-cpp',
      tagline: 'A fast, low-level systems language.',
      strengths: ['Performance', 'Control'],
      challenges: ['Manual memory management'],
      useCases: ['Game engines', 'Embedded systems'],
    });
    // Language-specific color mapping logic in the wrapper
    expect(cpp?.color.background).toBe('bg-purple-cpp');

    const java = result.find(
      (item: LanguageOption) => item.language === 'Java'
    );
    expect(java?.color.background).toBe('bg-orange-jv');
  });

  it('saveLanguage resolves without throwing on success', async () => {
    await expect(saveLanguage('Java')).resolves.toBeUndefined();
  });
});

describe('axios.ts — learning wrapper functions', () => {
  it('fetchMilestones returns the milestone list', async () => {
    const result = await fetchMilestones();

    expect(result).toHaveLength(1);
    expect(result[0]._id).toBe('milestone-1');
  });

  it('fetchLessonsByMilestone returns lessons for a given milestone', async () => {
    const result = await fetchLessonsByMilestone('milestone-1');

    expect(result).toHaveLength(1);
    expect(result[0]._id).toBe('lesson-1');
  });

  it('fetchLessonById returns the requested lesson detail, echoing the id', async () => {
    const result = await fetchLessonById('lesson-xyz');

    expect(result._id).toBe('lesson-xyz');
    expect(result.blocks).toHaveLength(1);
  });
});

describe('axios.ts — practice/exercise wrapper functions', () => {
  it('fetchExerciseById returns the exercise, echoing the requested id', async () => {
    const result = await fetchExerciseById('ex-1');

    expect(result._id).toBe('ex-1');
    expect(result.type).toBe('fill_blank');
  });

  it('submitExerciseAnswer posts the answer and returns the submission result', async () => {
    const result = await submitExerciseAnswer('ex-1', { input_1: 'x' });

    expect(result.correct).toBe(true);
    expect(result.attemptNumber).toBe(1);
  });

  it('getExerciseHint posts the requested hint level and returns the hint', async () => {
    const result = await getExerciseHint('ex-1', 1);

    expect(result.hintLevel).toBe(1);
    expect(result.hint).toBe('Try starting with the loop keyword.');
  });

  it('getExerciseHistory returns the attempt history array', async () => {
    const result = await getExerciseHistory('ex-1');

    expect(result).toEqual([]);
  });

  it('explainExerciseAnswer posts the answer and returns the AI explanation', async () => {
    const result = await explainExerciseAnswer('ex-1', { input_1: 'wrong' });

    expect(result.exerciseId).toBe('ex-1');
    expect(result.isCorrect).toBe(false);
    expect(result.feedback).toBe('You are close, review the concept.');
  });

  it('fetchWeaknessTags returns the weakness tag list', async () => {
    const result = await fetchWeaknessTags();

    expect(result).toEqual([]);
  });

  it('fetchExercises forwards query params and returns the paginated response', async () => {
    server.use(
      http.get('*/api/practice/exercises', ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get('language')).toBe('C++');
        expect(url.searchParams.get('difficulty')).toBe('easy');

        return HttpResponse.json({
          total: 1,
          page: 1,
          limit: 10,
          data: [{ _id: 'ex-9' }],
        });
      })
    );

    const result = await fetchExercises({
      language: 'C++',
      difficulty: 'easy',
      page: 1,
      limit: 10,
    });

    expect(result.total).toBe(1);
    expect(result.data[0]._id).toBe('ex-9');
  });
});

describe('axios.ts — dashboard wrapper function', () => {
  it('fetchDashboardData returns the full dashboard payload', async () => {
    const result = await fetchDashboardData();

    expect(result.user._id).toBe('user-1');
    expect(result.roadmap.title).toBe('C++ Roadmap');
    expect(result.stats.overallProgress).toBe(0);
  });
});

describe('axios.ts — 401 response interceptor', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    localStorage.clear();

    // jsdom doesn't implement real navigation, and window.location is
    // normally read-only in jsdom — redefine it so we can assert that the
    // interceptor actually attempted to set `.href`.
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, href: originalLocation.href },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
    vi.restoreAllMocks();
  });

  it('clears the stored token and redirects to /login when a 401 is received with a token present', async () => {
    localStorage.setItem('token', 'expired-token');

    server.use(
      http.get('*/api/auth/me', () =>
        HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
      )
    );

    await expect(getMe()).rejects.toBeInstanceOf(Error);

    expect(localStorage.getItem('token')).toBeNull();
  });

  it('does NOT attempt cleanup or redirect on a 401 when no token is present', async () => {
    // No token set in localStorage for this case.
    server.use(
      http.get('*/api/auth/me', () =>
        HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
      )
    );

    const hrefBefore = window.location.href;

    await expect(getMe()).rejects.toBeInstanceOf(Error);

    expect(localStorage.getItem('token')).toBeNull();
    expect(window.location.href).toBe(hrefBefore);
  });

  it('rejects with a plain Error (not the raw axios error) on a network failure', async () => {
    server.use(http.get('*/api/auth/me', () => HttpResponse.error()));

    await expect(getMe()).rejects.toBeInstanceOf(Error);
  });

  it('does not interfere with non-401 error responses', async () => {
    localStorage.setItem('token', 'some-token');

    server.use(
      http.get('*/api/auth/me', () =>
        HttpResponse.json({ message: 'Server error' }, { status: 500 })
      )
    );

    await expect(getMe()).rejects.toBeInstanceOf(Error);

    // Token should be untouched — only 401s trigger cleanup.
    expect(localStorage.getItem('token')).toBe('some-token');
  });
});

describe('axios.ts — request interceptor', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('attaches an Authorization header when a token is present', async () => {
    localStorage.setItem('token', 'attached-token');

    server.use(
      http.get('*/api/auth/me', ({ request }) => {
        expect(request.headers.get('authorization')).toBe(
          'Bearer attached-token'
        );
        return HttpResponse.json({
          _id: 'user-1',
          email: 'test@hcmut.edu.vn',
          selectedLanguage: ['C++'],
          createdAt: '2024-01-01T00:00:00.000Z',
        });
      })
    );

    await getMe();
  });

  it('omits the Authorization header when no token is present', async () => {
    server.use(
      http.get('*/api/auth/me', ({ request }) => {
        expect(request.headers.get('authorization')).toBeNull();
        return HttpResponse.json({
          _id: 'user-1',
          email: 'test@hcmut.edu.vn',
          selectedLanguage: ['C++'],
          createdAt: '2024-01-01T00:00:00.000Z',
        });
      })
    );

    await getMe();
  });
});
