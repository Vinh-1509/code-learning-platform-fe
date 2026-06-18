import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SubmitBar } from '@/components/practice_utils/shared/SubmitBar';

describe('SubmitBar', () => {
  it('disables the button when not all blanks are filled', () => {
    render(
      <SubmitBar allFilled={false} isSubmitting={false} onSubmit={vi.fn()} />
    );

    expect(screen.getByRole('button')).toBeDisabled();
    expect(
      screen.getByText(/fill in all blanks to enable submit/i)
    ).toBeInTheDocument();
  });

  it('enables the button when all blanks are filled', () => {
    render(
      <SubmitBar allFilled={true} isSubmitting={false} onSubmit={vi.fn()} />
    );

    expect(screen.getByRole('button')).not.toBeDisabled();
  });

  it('shows "Verifying..." and disables the button while submitting', () => {
    render(
      <SubmitBar allFilled={true} isSubmitting={true} onSubmit={vi.fn()} />
    );

    const button = screen.getByRole('button', { name: /verifying/i });
    expect(button).toBeDisabled();
  });

  it('disables the button after a correct answer when canResubmit is false', () => {
    render(
      <SubmitBar
        allFilled={true}
        isSubmitting={false}
        canResubmit={false}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByRole('button')).toBeDisabled();
    expect(
      screen.getByText(/modify your answer to submit again/i)
    ).toBeInTheDocument();
  });

  it('calls onSubmit when user clicks the enabled button', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <SubmitBar allFilled={true} isSubmitting={false} onSubmit={onSubmit} />
    );

    await user.click(screen.getByRole('button', { name: /submit answer/i }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
