import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { AvailableBlock } from '@/components/practice_utils/components/drag_drop/AvailableBlock';
import type { DraggableBlock } from '@/components/practice_utils/types/practiceTypes';

describe('AvailableBlock', () => {
  const block: DraggableBlock = {
    id: 'block-1',
    code: 'int x = 10;',
    indent: 0,
  };

  it('renders block code', () => {
    render(
      <AvailableBlock block={block} isUsed={false} onDragStart={vi.fn()} />
    );

    expect(screen.getByText('int x = 10;')).toBeInTheDocument();
  });

  it('is draggable when block is not used', () => {
    render(
      <AvailableBlock block={block} isUsed={false} onDragStart={vi.fn()} />
    );

    const element = screen.getByText('int x = 10;').parentElement;

    expect(element).toHaveAttribute('draggable', 'true');
  });

  it('is not draggable when block is used', () => {
    render(
      <AvailableBlock block={block} isUsed={true} onDragStart={vi.fn()} />
    );

    const element = screen.getByText('int x = 10;').parentElement;

    expect(element).toHaveAttribute('draggable', 'false');
  });

  it('applies disabled styling when used', () => {
    render(
      <AvailableBlock block={block} isUsed={true} onDragStart={vi.fn()} />
    );

    const element = screen.getByText('int x = 10;').parentElement;

    expect(element).toHaveClass('opacity-20');
    expect(element).toHaveClass('cursor-not-allowed');
  });

  it('applies active styling when available', () => {
    render(
      <AvailableBlock block={block} isUsed={false} onDragStart={vi.fn()} />
    );

    const element = screen.getByText('int x = 10;').parentElement;

    expect(element).toHaveClass('cursor-pointer');
    expect(element).toHaveClass('border-blue-400');
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <AvailableBlock
        block={block}
        isUsed={false}
        onDragStart={vi.fn()}
        onClick={onClick}
      />
    );

    await user.click(screen.getByText('int x = 10;'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('calls onDragStart with block id when drag starts', () => {
    const onDragStart = vi.fn();

    render(
      <AvailableBlock block={block} isUsed={false} onDragStart={onDragStart} />
    );

    const element = screen.getByText('int x = 10;').parentElement!;

    element.dispatchEvent(new Event('dragstart', { bubbles: true }));

    expect(onDragStart).toHaveBeenCalledWith('block-1');
  });

  it('does not call onDragStart when block is used', () => {
    const onDragStart = vi.fn();

    render(
      <AvailableBlock block={block} isUsed={true} onDragStart={onDragStart} />
    );

    const element = screen.getByText('int x = 10;').parentElement!;

    element.dispatchEvent(new Event('dragstart', { bubbles: true }));

    expect(onDragStart).not.toHaveBeenCalled();
  });
});
