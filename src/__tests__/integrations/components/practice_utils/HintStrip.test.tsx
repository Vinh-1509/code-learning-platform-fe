import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

import { HintStrip } from '@/components/practice_utils/shared/HintStrip';

describe('HintStrip', () => {
  it('shows "Get Hint" when there are no hints and panel is closed', () => {
    render(
      <HintStrip
        hints={[]}
        isOpen={false}
        onToggleHint={vi.fn()}
        onRequestHint={vi.fn()}
      />
    );

    expect(
      screen.getByRole('button', { name: /get hint/i })
    ).toBeInTheDocument();
  });

  it('shows "Next Hint" and hint count when hints exist and panel is closed', () => {
    render(
      <HintStrip
        hints={['hint1']}
        isOpen={false}
        onToggleHint={vi.fn()}
        onRequestHint={vi.fn()}
      />
    );

    expect(
      screen.getByRole('button', { name: /next hint/i })
    ).toBeInTheDocument();

    expect(screen.getByText('Hints (1)')).toBeInTheDocument();
  });

  it('shows "Hide Hint" and renders hint text when panel is open', () => {
    render(
      <HintStrip
        hints={['This is a hint']}
        isOpen={true}
        onToggleHint={vi.fn()}
        onRequestHint={vi.fn()}
      />
    );

    expect(
      screen.getByRole('button', { name: /hide hint/i })
    ).toBeInTheDocument();

    expect(screen.getByText('This is a hint')).toBeInTheDocument();
  });

  it('calls onRequestHint when button clicked and panel is closed', async () => {
    const user = userEvent.setup();

    const onRequestHint = vi.fn();
    const onToggleHint = vi.fn();

    render(
      <HintStrip
        hints={[]}
        isOpen={false}
        onToggleHint={onToggleHint}
        onRequestHint={onRequestHint}
      />
    );

    await user.click(screen.getByRole('button', { name: /get hint/i }));

    expect(onRequestHint).toHaveBeenCalledTimes(1);
    expect(onToggleHint).not.toHaveBeenCalled();
  });

  it('calls onToggleHint when button clicked and panel is open', async () => {
    const user = userEvent.setup();

    const onRequestHint = vi.fn();
    const onToggleHint = vi.fn();

    render(
      <HintStrip
        hints={['hint1']}
        isOpen={true}
        onToggleHint={onToggleHint}
        onRequestHint={onRequestHint}
      />
    );

    await user.click(screen.getByRole('button', { name: /hide hint/i }));

    expect(onToggleHint).toHaveBeenCalledTimes(1);
    expect(onRequestHint).not.toHaveBeenCalled();
  });

  it('renders all hints when panel is open', () => {
    render(
      <HintStrip
        hints={['Conceptual hint', 'Constraint hint', 'Final hint']}
        isOpen={true}
        onToggleHint={vi.fn()}
        onRequestHint={vi.fn()}
      />
    );

    expect(screen.getByText('Conceptual hint')).toBeInTheDocument();
    expect(screen.getByText('Constraint hint')).toBeInTheDocument();
    expect(screen.getByText('Final hint')).toBeInTheDocument();
  });
});
