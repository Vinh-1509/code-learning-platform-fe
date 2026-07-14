import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { createQueryWrapper } from '@/__tests__/helpers/queryWrapper';
// Mock the dashboard API layer module where the fetch function lives
vi.mock('@/features/dashboard/api/dashboard.api', () => ({
  fetchDashboardData: vi.fn(),
}));

import { useDashboardData } from '@/features/dashboard/useDashboard';
import { fetchDashboardData } from '@/features/dashboard/api/dashboard.api';
import type { DashboardResponse } from '@/types/api/dashboard.types';

describe('useDashboardData()', () => {
  const mockDashboardData = {
    user: { _id: 'user-1', email: 'test@hcmut.edu.vn', username: 'testuser' },
    roadmap: { _id: 'roadmap-1', title: 'C++ Beginner Roadmap' },
    stats: { totalLearnedLessons: 5, overallProgress: 25 },
    milestones: [],
    dailyReview: { pendingCount: 3 },
  } as unknown as DashboardResponse;

  beforeEach(() => {
    vi.clearAllMocks();
    // Spy on console.error to suppress intentional error logs during our failure tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('initializes with a loading state and null data', () => {
    // Return an unresolved promise so we can inspect the exact moment the hook mounts
    // before the async effect has a chance to resolve.
    vi.mocked(fetchDashboardData).mockReturnValueOnce(new Promise(() => {}));

    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useDashboardData(), { wrapper });

    expect(result.current.loading).toBe(true);
    expect(result.current.dashboardData).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('fetches and sets dashboard data successfully on mount', async () => {
    vi.mocked(fetchDashboardData).mockResolvedValueOnce(mockDashboardData);

    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useDashboardData(), { wrapper });

    // Wait for the async effect to finish loading
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.dashboardData).toEqual(mockDashboardData);
    expect(result.current.error).toBeNull();
    expect(fetchDashboardData).toHaveBeenCalledOnce();
  });

  it('handles API failure by setting an error message and clearing the loading state', async () => {
    const mockError = new Error('500 Internal Server Error');
    vi.mocked(fetchDashboardData).mockRejectedValueOnce(mockError);

    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useDashboardData(), { wrapper });

    // Wait for the async effect to catch the error
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.dashboardData).toBeNull();
    // Verifying your specific fallback error string from the catch block
    expect(result.current.error).toBe('Failed to load dashboard statistics.');
  });
});
