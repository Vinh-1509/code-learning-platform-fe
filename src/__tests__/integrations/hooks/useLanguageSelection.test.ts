import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { createQueryWrapper } from '@/__tests__/helpers/queryWrapper';
// Create a mock navigation tracking function
const mockNavigate = vi.fn();

// Mock TanStack Router
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock the API layer functions
vi.mock('@/features/language_selection/api/languages.api', () => ({
  fetchLanguages: vi.fn(),
  saveLanguage: vi.fn(),
}));

import { useLanguageSelection } from '@/features/language_selection/hooks/useLanguageSelection';
import {
  fetchLanguages,
  saveLanguage,
} from '@/features/language_selection/api/languages.api';
import type { LanguageOption } from '@/types/languageSelection';

describe('useLanguageSelection()', () => {
  const mockLanguages = [
    { id: 'lang-1', language: 'C++' },
    { id: 'lang-2', language: 'Python' },
  ] as unknown as LanguageOption[];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with accurate default state values on mount', () => {
    // Return a hanging promise to intercept the hook during initialization phase
    vi.mocked(fetchLanguages).mockReturnValueOnce(new Promise(() => {}));

    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useLanguageSelection(), { wrapper });

    expect(result.current.fetching).toBe(true);
    expect(result.current.languages).toEqual([]);
    expect(result.current.selected).toBeNull();
    expect(result.current.saving).toBe(false);
  });

  it('populates available languages and clears fetching flag upon successful load', async () => {
    vi.mocked(fetchLanguages).mockResolvedValueOnce(mockLanguages);

    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useLanguageSelection(), { wrapper });

    await waitFor(() => {
      expect(result.current.fetching).toBe(false);
    });

    expect(fetchLanguages).toHaveBeenCalledOnce();
    expect(result.current.languages).toEqual(mockLanguages);
  });

  it('safely breaks early out of confirmation routine if no selection has been made', async () => {
    vi.mocked(fetchLanguages).mockResolvedValueOnce(mockLanguages);

    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useLanguageSelection(), { wrapper });
    await waitFor(() => expect(result.current.fetching).toBe(false));

    // Changed to synchronous execution closure to adhere to @typescript-eslint specifications
    act(() => {
      result.current.handleConfirm();
    });

    expect(saveLanguage).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('safely breaks early if chosen language selection string does not map to list indices', async () => {
    vi.mocked(fetchLanguages).mockResolvedValueOnce(mockLanguages);

    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useLanguageSelection(), { wrapper });
    await waitFor(() => expect(result.current.fetching).toBe(false));

    act(() => {
      result.current.setSelected('invalid-id');
    });

    // HandleConfirm is synchronous for state orchestration, execution payload requires no await
    act(() => {
      result.current.handleConfirm();
    });

    expect(saveLanguage).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('saves preferences and navigates to /dashboard when execution flows optimally', async () => {
    vi.mocked(fetchLanguages).mockResolvedValueOnce(mockLanguages);
    vi.mocked(saveLanguage).mockResolvedValueOnce(undefined);

    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useLanguageSelection(), { wrapper });
    await waitFor(() => expect(result.current.fetching).toBe(false));

    act(() => {
      result.current.setSelected('lang-1');
    });

    act(() => {
      result.current.handleConfirm();
    });

    // Wait for the mutation to complete
    await waitFor(() => {
      expect(saveLanguage).toHaveBeenCalledWith('C++');
    });
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/dashboard' });
    expect(result.current.saving).toBe(false);
  });

  it('ensures saving animation state flags flip off even when save operations error out', async () => {
    vi.mocked(fetchLanguages).mockResolvedValueOnce(mockLanguages);
    vi.mocked(saveLanguage).mockRejectedValueOnce(new Error('Network failure'));

    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useLanguageSelection(), { wrapper });
    await waitFor(() => expect(result.current.fetching).toBe(false));

    act(() => {
      result.current.setSelected('lang-2');
    });

    act(() => {
      result.current.handleConfirm();
    });

    // Wait for the mutation error to be processed
    await waitFor(() => {
      expect(saveLanguage).toHaveBeenCalledWith('Python');
    });

    expect(result.current.saving).toBe(false);
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
