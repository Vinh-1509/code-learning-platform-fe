import { describe, it, expect } from 'vitest';
import { getCurrentLesson } from '@/features/dashboard/useRoadmap';
import type { Module } from '@/features/dashboard/useRoadmap';

// ── Test data builders ────────────────────────────────────────────────────────

function makeModule(overrides: Partial<Module> = {}): Module {
  return {
    id: 'module-1',
    name: 'Module One',
    status: 'locked',
    progress: 0,
    lessons: [],
    ...overrides,
  };
}

// ── getCurrentLesson() ────────────────────────────────────────────────────────

describe('getCurrentLesson()', () => {
  it('should return null for an empty modules array', () => {
    expect(getCurrentLesson([])).toBeNull();
  });

  it('should return null when all modules have no lessons', () => {
    const modules: Module[] = [
      makeModule({ id: 'mod-1', lessons: [] }),
      makeModule({ id: 'mod-2', lessons: [] }),
    ];
    expect(getCurrentLesson(modules)).toBeNull();
  });

  it('should return null when no lesson has "active" status', () => {
    const modules: Module[] = [
      makeModule({
        id: 'mod-1',
        lessons: [
          { id: 'l1', name: 'Lesson 1', status: 'completed' },
          { id: 'l2', name: 'Lesson 2', status: 'locked' },
        ],
      }),
    ];
    expect(getCurrentLesson(modules)).toBeNull();
  });

  it('should return the active lesson info when found in the first module', () => {
    const modules: Module[] = [
      makeModule({
        id: 'mod-1',
        name: 'Pointers',
        progress: 40,
        lessons: [
          { id: 'l1', name: 'Intro', status: 'completed' },
          { id: 'l2', name: 'Basics', status: 'active' },
          { id: 'l3', name: 'Advanced', status: 'locked' },
        ],
      }),
    ];

    const result = getCurrentLesson(modules);

    expect(result).not.toBeNull();
    expect(result?.lessonId).toBe('l2');
    expect(result?.lessonName).toBe('Basics');
    expect(result?.moduleName).toBe('Pointers');
    expect(result?.progress).toBe(40);
  });

  it('should find an active lesson in the second module when the first has none', () => {
    const modules: Module[] = [
      makeModule({
        id: 'mod-1',
        name: 'Module One',
        progress: 100,
        lessons: [{ id: 'l1', name: 'Done', status: 'completed' }],
      }),
      makeModule({
        id: 'mod-2',
        name: 'Module Two',
        progress: 25,
        lessons: [
          { id: 'l2', name: 'Active Lesson', status: 'active' },
          { id: 'l3', name: 'Next Up', status: 'locked' },
        ],
      }),
    ];

    const result = getCurrentLesson(modules);

    expect(result?.lessonId).toBe('l2');
    expect(result?.moduleName).toBe('Module Two');
    expect(result?.progress).toBe(25);
  });

  it('should return the FIRST active lesson encountered (left-to-right, top-to-bottom)', () => {
    // Two modules both have active lessons — should return the one from the first module
    const modules: Module[] = [
      makeModule({
        id: 'mod-1',
        name: 'First Module',
        progress: 50,
        lessons: [{ id: 'l1', name: 'First Active', status: 'active' }],
      }),
      makeModule({
        id: 'mod-2',
        name: 'Second Module',
        progress: 10,
        lessons: [{ id: 'l2', name: 'Second Active', status: 'active' }],
      }),
    ];

    const result = getCurrentLesson(modules);

    expect(result?.lessonId).toBe('l1');
    expect(result?.moduleName).toBe('First Module');
  });

  it('should use the module progress value (not lesson-level) in the return object', () => {
    const modules: Module[] = [
      makeModule({
        id: 'mod-1',
        progress: 75,
        lessons: [{ id: 'l1', name: 'Lesson', status: 'active' }],
      }),
    ];

    const result = getCurrentLesson(modules);
    expect(result?.progress).toBe(75);
  });

  it('should handle a module with only locked lessons gracefully', () => {
    const modules: Module[] = [
      makeModule({
        id: 'mod-1',
        lessons: [
          { id: 'l1', name: 'Lesson 1', status: 'locked' },
          { id: 'l2', name: 'Lesson 2', status: 'locked' },
        ],
      }),
    ];
    expect(getCurrentLesson(modules)).toBeNull();
  });
});
