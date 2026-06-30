import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import {
  useRoadmap,
  getCurrentLesson,
  type Module,
} from '@/features/dashboard/useRoadmap';
import { server } from '../../mocks/server';
import { createQueryWrapper } from '../../helpers/queryWrapper';

// ── Mocks ─────────────────────────────────────────────────────────────────────

// Mock the navigation/start hook so it doesn't trigger real router pushes
const mockStartLesson = vi.fn();
vi.mock('@/features/dashboard/useStartLesson', () => ({
  useStartLesson: () => mockStartLesson,
}));

// Suppress console.error in tests to keep the output clean when testing error states
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = vi.fn();
  vi.clearAllMocks();
});
afterEach(() => {
  console.error = originalConsoleError;
});

// ── Pure Function Tests ───────────────────────────────────────────────────────

describe('getCurrentLesson', () => {
  it('returns the first active lesson it finds', () => {
    const mockModules: Module[] = [
      {
        id: 'm1',
        name: 'Module 1',
        status: 'completed',
        progress: 100,
        lessons: [{ id: 'l1', name: 'Lesson 1', status: 'completed' }],
      },
      {
        id: 'm2',
        name: 'Module 2',
        status: 'active',
        progress: 50,
        lessons: [
          { id: 'l2', name: 'Lesson 2', status: 'completed' },
          { id: 'l3', name: 'Lesson 3', status: 'active' }, // Target
        ],
      },
    ];

    const result = getCurrentLesson(mockModules);
    expect(result).toEqual({
      lessonId: 'l3',
      lessonName: 'Lesson 3',
      moduleName: 'Module 2',
      progress: 50,
    });
  });

  it('returns null if no lessons are currently active', () => {
    const mockModules: Module[] = [
      {
        id: 'm1',
        name: 'Module 1',
        status: 'locked',
        progress: 0,
        lessons: [{ id: 'l1', name: 'Lesson 1', status: 'locked' }],
      },
    ];

    expect(getCurrentLesson(mockModules)).toBeNull();
  });
});

// ── Hook Tests ────────────────────────────────────────────────────────────────

describe('useRoadmap', () => {
  it('sorts modules by ID regardless of API return order', async () => {
    server.use(
      http.get('*/api/learning/milestones', () =>
        HttpResponse.json([
          {
            _id: 'z-99',
            title: 'Last',
            progress: { status: 'active', completionPercentage: 0 },
          },
          {
            _id: 'a-01',
            title: 'First',
            progress: { status: 'active', completionPercentage: 0 },
          },
        ])
      ),
      http.get('*/api/learning/milestones/*/lessons', () =>
        HttpResponse.json([])
      )
    );

    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useRoadmap(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.modules[0].id).toBe('a-01');
    expect(result.current.modules[1].id).toBe('z-99');
  });

  it('fetches, formats, and sorts milestones and lessons on mount', async () => {
    // 1. Setup MSW handlers for the API calls
    server.use(
      http.get('*/api/learning/milestones', () => {
        return HttpResponse.json([
          {
            _id: 'm2', // Out of order intentionally
            title: 'Advanced Concepts',
            progress: { status: 'locked', completionPercentage: 0 },
          },
          {
            _id: 'm1',
            title: 'Basics',
            progress: { status: 'active', completionPercentage: 50 },
          },
        ]);
      }),
      http.get('*/api/learning/milestones/:id/lessons', ({ params }) => {
        if (params.id === 'm1') {
          return HttpResponse.json([
            { _id: 'l1', title: 'Intro', progress: { status: 'completed' } },
          ]);
        }
        return HttpResponse.json([
          { _id: 'l2', title: 'Deep Dive', progress: { status: 'locked' } },
        ]);
      })
    );

    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useRoadmap(), { wrapper });

    // Initially loading
    expect(result.current.loading).toBe(true);
    expect(result.current.modules).toEqual([]);

    // Wait for the async API calls to resolve and state to update
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Verify data mapping and sorting (m1 should come before m2)
    expect(result.current.modules).toHaveLength(2);
    expect(result.current.modules[0]).toEqual({
      id: 'm1',
      name: 'Basics',
      status: 'active',
      progress: 50,
      lessons: [{ id: 'l1', name: 'Intro', status: 'completed' }],
    });
    expect(result.current.modules[1].id).toBe('m2');
  });

  it('handles API errors gracefully and stops loading', async () => {
    server.use(
      http.get('*/api/learning/milestones', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useRoadmap(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // TanStack Query exposes failures via isError/error, not a manual console.error log
    expect(result.current.modules).toEqual([]);
  });

  it('toggles module expansion correctly', async () => {
    // Mock basic successful response so hook finishes loading
    server.use(
      http.get('*/api/learning/milestones', () => HttpResponse.json([])),
      http.get('*/api/learning/milestones/*/lessons', () =>
        HttpResponse.json([])
      )
    );

    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useRoadmap(), { wrapper });

    // Wait for init to finish
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Initial state
    expect(result.current.expandedModules).toEqual([]);

    // Toggle ON
    act(() => {
      result.current.toggleModule('module-1');
    });
    expect(result.current.expandedModules).toEqual(['module-1']);

    // Toggle OFF
    act(() => {
      result.current.toggleModule('module-1');
    });
    expect(result.current.expandedModules).toEqual([]);
  });

  it('calls startLesson when handleStartLesson is triggered', () => {
    // Mock basic successful response
    server.use(
      http.get('*/api/learning/milestones', () => HttpResponse.json([])),
      http.get('*/api/learning/milestones/*/lessons', () =>
        HttpResponse.json([])
      )
    );

    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useRoadmap(), { wrapper });

    act(() => {
      result.current.handleStartLesson('lesson-123');
    });

    expect(mockStartLesson).toHaveBeenCalledWith('lesson-123');
  });
});
