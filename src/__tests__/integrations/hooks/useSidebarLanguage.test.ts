import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createQueryWrapper } from '@/__tests__/helpers/queryWrapper';
import { useSidebarLanguage } from '@/components/sidebar/useSidebarLanguage';
import { getMe } from '@/features/auth/api/auth.api';

vi.mock('@/features/auth/api/auth.api', () => ({
  getMe: vi.fn(),
}));

describe('useSidebarLanguage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads selected language successfully', async () => {
    vi.mocked(getMe).mockResolvedValue({
      _id: 'user-1',
      email: 'test@example.com',
      username: 'testuser',

      selectedLanguage: ['Java'],
      createdAt: '2026-01-01T00:00:00.000Z',
    });

    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useSidebarLanguage(), { wrapper });

    await waitFor(() => {
      expect(result.current.languageLabel).toBe('Java');
    });

    expect(getMe).toHaveBeenCalledTimes(1);
  });

  it('falls back to "Your Language" when selectedLanguage is undefined', async () => {
    vi.mocked(getMe).mockResolvedValue({
      _id: 'user-1',
      email: 'test@example.com',
      username: 'testuser',
      selectedLanguage: ['Java'],
      createdAt: '2026-01-01T00:00:00.000Z',
    });

    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useSidebarLanguage(), { wrapper });

    await waitFor(() => {
      expect(result.current.languageLabel).toBe('Your Language');
    });
  });

  it('falls back to "Your Language" when selectedLanguage is empty', async () => {
    vi.mocked(getMe).mockResolvedValue({
      _id: 'user-1',
      email: 'test@example.com',
      username: 'testuser',
      selectedLanguage: [],
      createdAt: '2026-01-01T00:00:00.000Z',
    });

    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useSidebarLanguage(), { wrapper });

    await waitFor(() => {
      expect(result.current.languageLabel).toBe('Your Language');
    });
  });

  it('falls back to "Your Language" when getMe fails', async () => {
    vi.mocked(getMe).mockRejectedValue(new Error('API Error'));

    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useSidebarLanguage(), { wrapper });

    await waitFor(() => {
      expect(result.current.languageLabel).toBe('Your Language');
    });

    expect(getMe).toHaveBeenCalledTimes(1);
  });
});
