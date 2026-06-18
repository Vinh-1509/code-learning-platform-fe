import { useState } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FillBlankPane } from '@/components/practice_utils/FillBlankPane';

import { fillBlankExerciseFixture } from '../../../fixtures/practiceExercises';

const baseProps = {
  description: fillBlankExerciseFixture.description,
  lines: fillBlankExerciseFixture.lines,
  hints: [],
  isHintOpen: false,
  showResult: null,
  isSubmitting: false,
  canResubmit: true,
  explanationStatus: { status: 'idle' as const },
  onToggleHint: vi.fn(),
  onRequestHint: vi.fn(),
};

function FillBlankHarness({
  onSubmit = vi.fn(),
  initialAnswers = {},
}: {
  onSubmit?: () => void;
  initialAnswers?: Record<string, string>;
}) {
  const [userAnswers, setUserAnswers] =
    useState<Record<string, string>>(initialAnswers);

  return (
    <FillBlankPane
      {...baseProps}
      userAnswers={userAnswers}
      onAnswerChange={(partId, value) => {
        setUserAnswers((prev) => ({ ...prev, [partId]: value }));
      }}
      onSubmit={onSubmit}
    />
  );
}

describe('FillBlankPane', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('shows the task description when showDescription is true', () => {
    render(
      <FillBlankPane
        {...baseProps}
        userAnswers={{}}
        onAnswerChange={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    expect(
      screen.getByText(fillBlankExerciseFixture.description)
    ).toBeInTheDocument();
  });

  it('keeps submit disabled until every blank is filled', () => {
    render(
      <FillBlankPane
        {...baseProps}
        userAnswers={{}}
        onAnswerChange={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    expect(
      screen.getByRole('button', { name: /submit answer/i })
    ).toBeDisabled();
  });

  it('enables submit when all blanks have answers', () => {
    render(
      <FillBlankPane
        {...baseProps}
        userAnswers={{ input_1: 'count' }}
        onAnswerChange={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    expect(
      screen.getByRole('button', { name: /submit answer/i })
    ).not.toBeDisabled();
  });

  it('calls onSubmit after the user fills every blank and clicks submit', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<FillBlankHarness onSubmit={onSubmit} />);

    await user.type(screen.getByPlaceholderText('[input_1]'), 'count');
    await user.click(screen.getByRole('button', { name: /submit answer/i }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('shows the result banner when showResult is set', () => {
    render(
      <FillBlankPane
        {...baseProps}
        userAnswers={{ input_1: 'count' }}
        showResult="correct"
        onAnswerChange={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByText(/correct answer/i)).toBeInTheDocument();
  });
});
