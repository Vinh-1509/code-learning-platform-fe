import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks ─────────────────────────────────────────────────────────────────────
vi.mock('@tanstack/react-router', () => ({
  redirect: (opts: { to: string }) => ({ __isRedirect: true, to: opts.to }),
}));

vi.mock('@/lib/axios', () => ({
  getMe: vi.fn(),
}));

import {
  requireAuth,
  checkLanguageSelection,
  getAccessToken,
} from '@/lib/auth';
import { getMe } from '@/lib/axios';

// ── Helpers ───────────────────────────────────────────────────────────────────

const mockGetMe = vi.mocked(getMe);

type MockUser = Awaited<ReturnType<typeof getMe>>;

/** Minimal user object. Pass an empty array or omit the arg to simulate no language selected. */
function makeUser(selectedLanguage: string[] = ['C++']): MockUser {
  return {
    _id: 'user-1',
    email: 'test@example.com',
    createdAt: '2024-01-01T00:00:00Z',
    selectedLanguage,
  };
}

/** Cast a partial shape to MockUser — avoids repeating every required field in edge-case tests. */
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

    // We don't care about the throw here — just the side-effect
    await expect(requireAuth()).rejects.toBeDefined();

    expect(localStorage.getItem('token')).toBeNull();
  });

  it('should throw redirect to /languageselection when user has no selectedLanguage property', async () => {
    localStorage.setItem('token', 'valid-token');
    // Simulate a user who has never picked a language — property is absent
    mockGetMe.mockResolvedValueOnce(
      partialUser({ selectedLanguage: undefined })
    );

    await expect(requireAuth()).rejects.toMatchObject({
      to: '/languageselection',
    });
  });

  it('should throw redirect to /languageselection when selectedLanguage is an empty array', async () => {
    localStorage.setItem('token', 'valid-token');
    mockGetMe.mockResolvedValueOnce(makeUser([]));

    await expect(requireAuth()).rejects.toMatchObject({
      to: '/languageselection',
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
