// src/__tests__/unit/lib/auth.test.ts
// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks ─────────────────────────────────────────────────────────────────────

// TanStack Router: redirect() throws, isRedirect() checks if the thrown value was a redirect
const mockRedirect = vi.fn((opts: unknown) => {
  throw opts;
});
const mockIsRedirect = vi.fn((err: unknown) => {
  return typeof err === 'object' && err !== null && 'to' in err;
});

vi.mock('@tanstack/react-router', () => ({
  redirect: (opts: unknown) => mockRedirect(opts),
  isRedirect: (err: unknown) => mockIsRedirect(err),
}));

vi.mock('@/features/auth/api/auth.api', () => ({
  getMe: vi.fn(),
}));

// Mock queryClient: ensureQueryData delegates to the queryFn directly (no retry, no cache)
vi.mock('@/lib/queryClient', () => ({
  queryClient: {
    ensureQueryData: vi.fn(({ queryFn }: { queryFn: () => Promise<unknown> }) =>
      queryFn()
    ),
  },
}));

import {
  requireAuth,
  checkLanguageSelection,
  getAccessToken,
} from '@/lib/auth';
import { getMe } from '@/features/auth/api/auth.api';

// ── Helpers ───────────────────────────────────────────────────────────────────

const mockGetMe = vi.mocked(getMe);

type MockUser = Awaited<ReturnType<typeof getMe>>;

/** Tạo object user giả lập tối giản. Mặc định chọn C++ nếu không truyền tham số. */
function makeUser(selectedLanguage: string[] = ['C++']): MockUser {
  return {
    _id: 'user-1',
    email: 'test@example.com',
    username: 'testuser',
    coins: 100,
    createdAt: '2024-01-01T00:00:00Z',
    selectedLanguage,
  };
}

/** Ép kiểu dữ liệu từng phần cho MockUser — né việc lặp lại các trường bắt buộc trong case đặc biệt. */
function partialUser(overrides: Partial<MockUser>): MockUser {
  return { ...makeUser(), ...overrides };
}

// ── getAccessToken() ──────────────────────────────────────────────────────────

describe('getAccessToken()', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should return null when no token is stored', () => {
    expect(getAccessToken()).toBeNull();
  });

  it('should return the stored token string', () => {
    localStorage.setItem('token', 'abc.123.xyz');
    expect(getAccessToken()).toBe('abc.123.xyz');
  });
});

// ── requireAuth() ─────────────────────────────────────────────────────────────

describe('requireAuth()', () => {
  beforeEach(() => {
    localStorage.clear();
    mockGetMe.mockReset();
    mockRedirect.mockClear();
    mockIsRedirect.mockClear();
  });

  it('should throw redirect to /login when localStorage has no token', async () => {
    await expect(requireAuth()).rejects.toMatchObject({ to: '/login' });
  });

  it('should throw redirect to /login when getMe() rejects (expired / invalid token)', async () => {
    localStorage.setItem('token', 'expired-token');
    mockGetMe.mockRejectedValueOnce(new Error('401 Unauthorized'));

    await expect(requireAuth()).rejects.toMatchObject({ to: '/login' });
  });

  it('should remove the token from localStorage when getMe() rejects', async () => {
    localStorage.setItem('token', 'expired-token');
    mockGetMe.mockRejectedValueOnce(new Error('401 Unauthorized'));

    await expect(requireAuth()).rejects.toBeDefined();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('should throw redirect to /language-selection when user has no selectedLanguage property', async () => {
    localStorage.setItem('token', 'valid-token');
    mockGetMe.mockResolvedValueOnce(
      partialUser({ selectedLanguage: undefined })
    );

    await expect(requireAuth()).rejects.toMatchObject({
      to: '/language-selection',
    });
  });

  it('should throw redirect to /language-selection when selectedLanguage is an empty array', async () => {
    localStorage.setItem('token', 'valid-token');
    mockGetMe.mockResolvedValueOnce(makeUser([]));

    await expect(requireAuth()).rejects.toMatchObject({
      to: '/language-selection',
    });
  });

  it('should resolve without throwing when token is valid and a language is selected', async () => {
    localStorage.setItem('token', 'valid-token');
    mockGetMe.mockResolvedValueOnce(makeUser(['C++']));

    await expect(requireAuth()).resolves.toBeUndefined();
  });

  it('should NOT remove the token from localStorage on a successful auth check', async () => {
    localStorage.setItem('token', 'valid-token');
    mockGetMe.mockResolvedValueOnce(makeUser(['Java']));

    await requireAuth();
    expect(localStorage.getItem('token')).toBe('valid-token');
  });
});

// ── checkLanguageSelection() ──────────────────────────────────────────────────

describe('checkLanguageSelection()', () => {
  beforeEach(() => {
    localStorage.clear();
    mockGetMe.mockReset();
    mockRedirect.mockClear();
    mockIsRedirect.mockClear();
  });

  it('should throw redirect to /login when localStorage has no token', async () => {
    await expect(checkLanguageSelection()).rejects.toMatchObject({
      to: '/login',
    });
  });

  it('should throw redirect to /login when getMe() rejects', async () => {
    localStorage.setItem('token', 'expired-token');
    mockGetMe.mockRejectedValueOnce(new Error('401 Unauthorized'));

    await expect(checkLanguageSelection()).rejects.toMatchObject({
      to: '/login',
    });
  });

  it('should remove the token from localStorage when getMe() rejects', async () => {
    localStorage.setItem('token', 'expired-token');
    mockGetMe.mockRejectedValueOnce(new Error('401 Unauthorized'));

    await expect(checkLanguageSelection()).rejects.toBeDefined();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('should throw redirect to /dashboard when the user already has a language selected', async () => {
    localStorage.setItem('token', 'valid-token');
    mockGetMe.mockResolvedValueOnce(makeUser(['C++']));

    await expect(checkLanguageSelection()).rejects.toMatchObject({
      to: '/dashboard',
    });
  });

  it('should throw redirect to /dashboard for any non-empty selectedLanguage array', async () => {
    localStorage.setItem('token', 'valid-token');
    mockGetMe.mockResolvedValueOnce(makeUser(['Java']));

    await expect(checkLanguageSelection()).rejects.toMatchObject({
      to: '/dashboard',
    });
  });

  it('should resolve without throwing when selectedLanguage is an empty array (user stays on selection page)', async () => {
    localStorage.setItem('token', 'valid-token');
    mockGetMe.mockResolvedValueOnce(makeUser([]));

    await expect(checkLanguageSelection()).resolves.toBeUndefined();
  });

  it('should resolve without throwing when selectedLanguage property is absent entirely', async () => {
    localStorage.setItem('token', 'valid-token');
    mockGetMe.mockResolvedValueOnce(
      partialUser({ selectedLanguage: undefined })
    );

    await expect(checkLanguageSelection()).resolves.toBeUndefined();
  });
});
