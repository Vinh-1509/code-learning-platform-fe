import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createQueryWrapper } from '@/__tests__/helpers/queryWrapper';
import { useSidebarLanguage } from '@/components/sidebar/useSidebarLanguage';
import * as authModule from '@/features/auth/useAuth';

vi.mock('@/features/auth/useAuth', () => ({
  useAuth: vi.fn(),
}));

describe('useSidebarLanguage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads selected language successfully', () => {
    vi.mocked(authModule.useAuth).mockReturnValue({
      user: {
        _id: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        coins: 100,
        selectedLanguage: ['Java'],
        createdAt: '2026-01-01T00:00:00.000Z',
        hasSeenTour: false,
      },
      logout: vi.fn(),
      loading: false,
    } as any);

    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useSidebarLanguage(), { wrapper });

    expect(result.current.languageLabel).toBe('Java');
  });

  it('falls back to "Your Language" when selectedLanguage is undefined', () => {
    vi.mocked(authModule.useAuth).mockReturnValue({
      user: {
        _id: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        coins: 100,
        selectedLanguage: undefined,
        createdAt: '2026-01-01T00:00:00.000Z',
        hasSeenTour: false,
      },
      logout: vi.fn(),
      loading: false,
    } as any);

    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useSidebarLanguage(), { wrapper });

    expect(result.current.languageLabel).toBe('Your Language');
  });

  it('falls back to "Your Language" when selectedLanguage is empty', () => {
    vi.mocked(authModule.useAuth).mockReturnValue({
      user: {
        _id: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        coins: 100,
        selectedLanguage: [],
        createdAt: '2026-01-01T00:00:00.000Z',
        hasSeenTour: false,
      },
      logout: vi.fn(),
      loading: false,
    } as any);

    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useSidebarLanguage(), { wrapper });

    expect(result.current.languageLabel).toBe('Your Language');
  });
});
