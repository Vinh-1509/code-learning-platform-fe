import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  requireAuth,
  checkLanguageSelection,
  getAccessToken,
} from '@/lib/auth';

// TanStack Router redirect() throws — we catch the redirect target in tests
const mockRedirect = vi.fn((opts: unknown) => {
  throw opts;
});

vi.mock('@tanstack/react-router', () => ({
  redirect: (opts: unknown) => mockRedirect(opts),
}));

const mockGetMe = vi.fn();
vi.mock('@/lib/axios', () => ({
  getMe: () => mockGetMe(),
}));

describe('getAccessToken()', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns null when no token is stored', () => {
    expect(getAccessToken()).toBeNull();
  });

  it('returns the token from localStorage', () => {
    localStorage.setItem('token', 'my-jwt');
    expect(getAccessToken()).toBe('my-jwt');
  });
});

describe('requireAuth()', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('redirects to login when there is no token', async () => {
    await expect(requireAuth()).rejects.toEqual({ to: '/login' });
  });

  it('redirects to login and clears token when getMe fails', async () => {
    localStorage.setItem('token', 'bad-token');
    mockGetMe.mockRejectedValue(new Error('Unauthorized'));

    await expect(requireAuth()).rejects.toEqual({ to: '/login' });
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('redirects to language selection when user has no language', async () => {
    localStorage.setItem('token', 'valid-token');
    mockGetMe.mockResolvedValue({ selectedLanguage: [] });

    await expect(requireAuth()).rejects.toEqual({ to: '/languageselection' });
  });

  it('allows access when user has a token and selected language', async () => {
    localStorage.setItem('token', 'valid-token');
    mockGetMe.mockResolvedValue({ selectedLanguage: ['C++'] });

    await expect(requireAuth()).resolves.toBeUndefined();
  });
});

describe('checkLanguageSelection()', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('redirects to login when there is no token', async () => {
    await expect(checkLanguageSelection()).rejects.toEqual({ to: '/login' });
  });

  it('redirects to dashboard when user already picked a language', async () => {
    localStorage.setItem('token', 'valid-token');
    mockGetMe.mockResolvedValue({ selectedLanguage: ['C++'] });

    await expect(checkLanguageSelection()).rejects.toEqual({
      to: '/dashboard',
    });
  });

  it('stays on language page when user has not picked a language yet', async () => {
    localStorage.setItem('token', 'valid-token');
    mockGetMe.mockResolvedValue({ selectedLanguage: [] });

    await expect(checkLanguageSelection()).resolves.toBeUndefined();
  });
});
