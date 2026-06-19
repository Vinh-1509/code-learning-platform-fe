import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

import { ExerciseTabBar } from '@/features/lesson/ExerciseTabBar';
import type { DragDropExercise } from '@/components/practice_utils/types/practiceTypes';

const mockExercises = [
  {
    id: 'ex-1',
    type: 'dragdrop',
    title: 'Question 1',
    expectedSlots: 1,
    blocks: [],
    description: '',
  },
  {
    id: 'ex-2',
    type: 'dragdrop',
    title: 'Question 2',
    expectedSlots: 1,
    blocks: [],
    description: '',
  },
] satisfies DragDropExercise[];

describe('ExerciseTabBar', () => {
  it('renders loading state', () => {
    render(
      <ExerciseTabBar
        loading={true}
        error={null}
        exercises={[]}
        exercisePassMap={{}}
        activeExerciseIndex={0}
        setActiveExerciseIndex={vi.fn()}
      />
    );

    expect(screen.getByText(/loading exercises/i)).toBeInTheDocument();
  });

  it('renders error state', () => {
    render(
      <ExerciseTabBar
        loading={false}
        error="boom"
        exercises={[]}
        exercisePassMap={{}}
        activeExerciseIndex={0}
        setActiveExerciseIndex={vi.fn()}
      />
    );

    expect(screen.getByText(/failed to load exercises/i)).toBeInTheDocument();
  });

  it('renders empty state', () => {
    render(
      <ExerciseTabBar
        loading={false}
        error={null}
        exercises={[]}
        exercisePassMap={{}}
        activeExerciseIndex={0}
        setActiveExerciseIndex={vi.fn()}
      />
    );

    expect(screen.getByText(/no practice available/i)).toBeInTheDocument();
  });

  it('renders one button per exercise', () => {
    render(
      <ExerciseTabBar
        loading={false}
        error={null}
        exercises={mockExercises}
        exercisePassMap={{}}
        activeExerciseIndex={0}
        setActiveExerciseIndex={vi.fn()}
      />
    );

    expect(
      screen.getByRole('button', { name: /question 1/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: /question 2/i })
    ).toBeInTheDocument();
  });

  it('highlights active exercise', () => {
    render(
      <ExerciseTabBar
        loading={false}
        error={null}
        exercises={mockExercises}
        exercisePassMap={{}}
        activeExerciseIndex={0}
        setActiveExerciseIndex={vi.fn()}
      />
    );

    const activeButton = screen.getByRole('button', {
      name: /question 1/i,
    });

    expect(activeButton.className).toContain('bg-blue-600');
  });

  it('shows checkmark for passed exercises', () => {
    render(
      <ExerciseTabBar
        loading={false}
        error={null}
        exercises={mockExercises}
        exercisePassMap={{ 'ex-1': true }}
        activeExerciseIndex={1}
        setActiveExerciseIndex={vi.fn()}
      />
    );

    expect(
      screen.getByRole('button', { name: /question 1/i })
    ).toHaveTextContent('✓');
  });

  it('shows active passed exercise in green', () => {
    render(
      <ExerciseTabBar
        loading={false}
        error={null}
        exercises={mockExercises}
        exercisePassMap={{ 'ex-1': true }}
        activeExerciseIndex={0}
        setActiveExerciseIndex={vi.fn()}
      />
    );

    const button = screen.getByRole('button', {
      name: /question 1/i,
    });

    expect(button.className).toContain('bg-emerald-600');
  });

  it('calls setActiveExerciseIndex when tab clicked', async () => {
    const user = userEvent.setup();
    const setActiveExerciseIndex = vi.fn();

    render(
      <ExerciseTabBar
        loading={false}
        error={null}
        exercises={mockExercises}
        exercisePassMap={{}}
        activeExerciseIndex={0}
        setActiveExerciseIndex={setActiveExerciseIndex}
      />
    );

    await user.click(screen.getByRole('button', { name: /question 2/i }));

    expect(setActiveExerciseIndex).toHaveBeenCalledWith(1);
  });
});
