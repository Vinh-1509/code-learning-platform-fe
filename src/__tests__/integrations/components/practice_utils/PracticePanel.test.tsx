import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PracticePanel } from '@/components/practice_utils/PracticePanel';

import {
  dragDropExerciseFixture,
  fillBlankExerciseFixture,
} from '../../../fixtures/practiceExercises';

describe('PracticePanel', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('renders fill-blank UI for fillblank exercises', async () => {
    render(
      <PracticePanel
        exercise={fillBlankExerciseFixture}
        onSubmit={vi.fn()}
        onGetHint={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Code Editor')).toBeInTheDocument();
    });
    expect(screen.getByPlaceholderText('[input_1]')).toBeInTheDocument();
  });

  it('renders drag-and-drop UI for dragdrop exercises', async () => {
    render(
      <PracticePanel
        exercise={dragDropExerciseFixture}
        onSubmit={vi.fn()}
        onGetHint={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/available blocks/i)).toBeInTheDocument();
    });
    expect(screen.getByText('for')).toBeInTheDocument();
    expect(screen.getByText('while')).toBeInTheDocument();
  });

  it('shows the correct banner after a successful fill-blank submission', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue({ correct: true });

    render(
      <PracticePanel
        exercise={fillBlankExerciseFixture}
        onSubmit={onSubmit}
        onGetHint={vi.fn()}
      />
    );

    await user.type(screen.getByPlaceholderText('[input_1]'), 'count');
    await user.click(screen.getByRole('button', { name: /submit answer/i }));

    await waitFor(() => {
      expect(screen.getByText(/correct answer/i)).toBeInTheDocument();
    });
    expect(onSubmit).toHaveBeenCalledWith(
      fillBlankExerciseFixture.id,
      expect.any(Object)
    );
  });

  it('shows wrong banner and AI explanation after a failed fill-blank submission', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue({ correct: false });
    const onExplain = vi.fn().mockResolvedValue({
      exerciseId: fillBlankExerciseFixture.id,
      isCorrect: false,
      feedback: 'Use count as the variable name.',
      items: [],
      suggestion: 'Pick a descriptive name.',
    });

    render(
      <PracticePanel
        exercise={fillBlankExerciseFixture}
        onSubmit={onSubmit}
        onGetHint={vi.fn()}
        onExplain={onExplain}
      />
    );

    await user.type(screen.getByPlaceholderText('[input_1]'), 'wrong');
    await user.click(screen.getByRole('button', { name: /submit answer/i }));

    await waitFor(() => {
      expect(screen.getByText(/incorrect/i)).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(
        screen.getByText('Use count as the variable name.')
      ).toBeInTheDocument();
    });
    expect(onExplain).toHaveBeenCalled();
  });

  it('fills drag-drop slots and submits the prepared answer', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue({ correct: true });

    render(
      <PracticePanel
        exercise={dragDropExerciseFixture}
        onSubmit={onSubmit}
        onGetHint={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('for')).toBeInTheDocument();
    });

    await user.click(screen.getByText('for'));
    await user.click(screen.getByText('while'));
    await user.click(screen.getByRole('button', { name: /submit answer/i }));

    await waitFor(() => {
      expect(screen.getByText(/correct answer/i)).toBeInTheDocument();
    });
    expect(onSubmit).toHaveBeenCalledWith(dragDropExerciseFixture.id, {
      '1': 'b1',
      '2': 'b2',
    });
  });

  it('reveals a hint after the user requests one', async () => {
    const user = userEvent.setup();
    const onGetHint = vi.fn().mockResolvedValue({
      hintLevel: 1,
      hint: 'Try starting with the loop keyword.',
    });

    render(
      <PracticePanel
        exercise={fillBlankExerciseFixture}
        onSubmit={vi.fn()}
        onGetHint={onGetHint}
      />
    );

    await user.click(screen.getByRole('button', { name: /get hint/i }));

    await waitFor(() => {
      expect(
        screen.getByText('The variable stores a count.')
      ).toBeInTheDocument();
    });
    expect(onGetHint).toHaveBeenCalledWith(fillBlankExerciseFixture.id);
  });
});
