import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { LearningRoadmap } from '@/features/dashboard/LearningRoadmap';
import type { Module } from '@/features/dashboard/useRoadmap';

function makeModule(overrides: Partial<Module> = {}): Module {
  return {
    id: 'module-1',
    name: 'Module One',
    status: 'active',
    progress: 50,
    lessons: [{ id: 'lesson-1', name: 'Intro to Loops', status: 'active' }],
    ...overrides,
  };
}

describe('LearningRoadmap', () => {
  it('shows a loading message while data is fetching', () => {
    render(
      <LearningRoadmap
        modules={[]}
        expandedModules={[]}
        toggleModule={vi.fn()}
        handleStartLesson={vi.fn()}
        loading={true}
      />
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('lists module names when loading is done', () => {
    const modules = [
      makeModule({ id: 'm1', name: 'Pointers' }),
      makeModule({ id: 'm2', name: 'Arrays' }),
    ];

    render(
      <LearningRoadmap
        modules={modules}
        expandedModules={[]}
        toggleModule={vi.fn()}
        handleStartLesson={vi.fn()}
        loading={false}
      />
    );

    expect(screen.getByText('Pointers')).toBeInTheDocument();
    expect(screen.getByText('Arrays')).toBeInTheDocument();
  });

  it('calls toggleModule when user clicks a module header', async () => {
    const user = userEvent.setup();
    const toggleModule = vi.fn();
    const modules = [makeModule({ id: 'mod-1', name: 'Pointers' })];

    render(
      <LearningRoadmap
        modules={modules}
        expandedModules={[]}
        toggleModule={toggleModule}
        handleStartLesson={vi.fn()}
        loading={false}
      />
    );

    await user.click(screen.getByText('Pointers'));
    expect(toggleModule).toHaveBeenCalledWith('mod-1');
  });

  it('calls handleStartLesson when user clicks Start on an active lesson', async () => {
    const user = userEvent.setup();
    const handleStartLesson = vi.fn();
    const modules = [makeModule({ id: 'mod-1', name: 'Loops' })];

    render(
      <LearningRoadmap
        modules={modules}
        expandedModules={['mod-1']}
        toggleModule={vi.fn()}
        handleStartLesson={handleStartLesson}
        loading={false}
      />
    );

    await user.click(screen.getByText('Intro to Loops'));
    expect(handleStartLesson).toHaveBeenCalledWith('lesson-1');
  });
});
