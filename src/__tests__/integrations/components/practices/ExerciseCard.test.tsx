import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import { ExerciseCard } from '@/features/practices/ExerciseCard';
import type { Exercise } from '@/types/api/exercise.types';

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    to,
    params,
  }: {
    children: React.ReactNode;
    to: string;
    params?: Record<string, string>;
  }) => {
    let resolvedHref = to;
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        resolvedHref = resolvedHref.replace(`$${key}`, value);
      });
    }
    return <a href={resolvedHref}>{children}</a>;
  },
}));

// ── Test Data ─────────────────────────────────────────────────────────────────

const mockBaseExercise: Exercise = {
  _id: 'ex-123',
  title: 'Binary Tree Inversion',
  instruction: 'Invert a binary tree iteratively or recursively.',
  level: 'medium',
  status: 'active',
  tagId: ['trees'],
  type: 'drag_drop',
  language: 'C++',
  order: 1,
};

// ── Test Cases ────────────────────────────────────────────────────────────────

describe('ExerciseCard Component', () => {
  describe('Rendering Content & Difficulty Styles', () => {
    it('renders the core exercise texts', () => {
      render(<ExerciseCard exercise={mockBaseExercise} />);

      expect(screen.getByText('Binary Tree Inversion')).toBeInTheDocument();
      expect(
        screen.getByText('Invert a binary tree iteratively or recursively.')
      ).toBeInTheDocument();
    });

    it('applies the appropriate styling tokens for each difficulty setting', () => {
      const { rerender } = render(
        <ExerciseCard exercise={{ ...mockBaseExercise, level: 'easy' }} />
      );
      let badge = screen.getByText('easy');
      expect(badge).toHaveClass('text-green-700', 'bg-green-50');

      rerender(
        <ExerciseCard exercise={{ ...mockBaseExercise, level: 'medium' }} />
      );
      badge = screen.getByText('medium');
      expect(badge).toHaveClass('text-amber-700', 'bg-amber-50');

      rerender(
        <ExerciseCard exercise={{ ...mockBaseExercise, level: 'hard' }} />
      );
      badge = screen.getByText('hard');
      expect(badge).toHaveClass('text-red-700', 'bg-red-50');
    });
  });

  describe('Conditional States (Status Matrix)', () => {
    it('renders an active exercise with a "Start" link button', () => {
      render(
        <ExerciseCard exercise={{ ...mockBaseExercise, status: 'active' }} />
      );

      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/practice-dedicated/ex-123');

      expect(screen.queryByText('Completed')).not.toBeInTheDocument();
      expect(screen.queryByText('Locked')).not.toBeInTheDocument();
    });

    it('renders a completed exercise state with feedback tags and the start button', () => {
      render(
        <ExerciseCard exercise={{ ...mockBaseExercise, status: 'completed' }} />
      );

      expect(screen.getByText('Completed')).toBeInTheDocument();
      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(screen.queryByText('Locked')).not.toBeInTheDocument();
    });

    it('renders a locked exercise explicitly disabled', () => {
      render(
        <ExerciseCard exercise={{ ...mockBaseExercise, status: 'locked' }} />
      );

      expect(screen.getByText('Locked')).toBeInTheDocument();
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
      expect(screen.queryByText('Completed')).not.toBeInTheDocument();
    });
  });

  describe('Algorithmic Weakness Recommendation UI Banner', () => {
    it('shows the "Review Needed" badge if flagged as a weak area and exercise is unlocked', () => {
      render(
        <ExerciseCard
          exercise={{ ...mockBaseExercise, status: 'active' }}
          isWeakRecommend={true}
        />
      );

      expect(screen.getByText('Review Needed')).toBeInTheDocument();
    });

    it('hides the "Review Needed" badge if the exercise is marked locked, regardless of flag parameter', () => {
      render(
        <ExerciseCard
          exercise={{ ...mockBaseExercise, status: 'locked' }}
          isWeakRecommend={true}
        />
      );

      expect(screen.queryByText('Review Needed')).not.toBeInTheDocument();
    });

    it('hides the "Review Needed" badge if flag parameter is absent', () => {
      render(
        <ExerciseCard
          exercise={{ ...mockBaseExercise, status: 'active' }}
          isWeakRecommend={false}
        />
      );

      expect(screen.queryByText('Review Needed')).not.toBeInTheDocument();
    });
  });
});
