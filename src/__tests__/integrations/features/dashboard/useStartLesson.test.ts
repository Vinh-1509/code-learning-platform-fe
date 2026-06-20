import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNavigate } from '@tanstack/react-router';

import { useStartLesson } from '@/features/dashboard/useStartLesson';

vi.mock('@tanstack/react-router', () => ({
  useNavigate: vi.fn(),
}));

describe('useStartLesson()', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
  });

  it('navigates to the correct dynamic lesson route with the provided ID', () => {
    const { result } = renderHook(() => useStartLesson());

    act(() => {
      result.current('lesson-999');
    });

    expect(mockNavigate).toHaveBeenCalledOnce();
    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/lesson/$lessonId',
      params: { lessonId: 'lesson-999' },
    });
  });
});
