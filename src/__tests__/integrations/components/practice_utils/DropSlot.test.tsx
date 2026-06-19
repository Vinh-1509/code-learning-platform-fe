import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DropSlot } from '@/components/practice_utils/components/drag_drop/DropSlot';
import type { DraggableBlock } from '@/components/practice_utils/types/practiceTypes';

describe('DropSlot', () => {
  const defaultProps = {
    slotIndex: 0,
    isOver: false,
    onDrop: vi.fn(),
    onDragOver: vi.fn(),
    onDragLeave: vi.fn(),
    onDragStart: vi.fn(),
    onRemove: vi.fn(),
  };

  const mockBlock: DraggableBlock = {
    id: 'block-123',
    code: 'int main() {',
    indent: 1,
  };

  it('renders the empty state correctly when no block is provided', () => {
    render(<DropSlot {...defaultProps} />);

    // Slot index is 0, so it displays "1"
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('+ drop here')).toBeInTheDocument();

    // Ensure remove button is not present
    expect(screen.queryByRole('button', { name: '✕' })).not.toBeInTheDocument();
  });

  it('applies hover styling when isOver is true in empty state', () => {
    const { container } = render(<DropSlot {...defaultProps} isOver={true} />);

    const slotElement = container.firstChild as HTMLElement;
    expect(slotElement).toHaveClass('bg-primary-second/70', 'border-dashed');
  });

  it('renders the filled state correctly when a block is provided', () => {
    render(<DropSlot {...defaultProps} slotIndex={2} block={mockBlock} />);

    // Slot index is 2, so it displays "3"
    expect(screen.getByText('3')).toBeInTheDocument();

    // Check if code is rendered (accounting for the 1 indent space spacing)
    expect(
      screen.getByText('int main() {', { exact: false })
    ).toBeInTheDocument();

    // Verify "+ drop here" is gone
    expect(screen.queryByText('+ drop here')).not.toBeInTheDocument();

    // Verify Remove button exists
    expect(screen.getByRole('button', { name: '✕' })).toBeInTheDocument();
  });

  it('calls onRemove with the correct slotIndex when the remove button is clicked', async () => {
    const user = userEvent.setup();
    render(<DropSlot {...defaultProps} slotIndex={1} block={mockBlock} />);

    const removeBtn = screen.getByRole('button', { name: '✕' });
    await user.click(removeBtn);

    expect(defaultProps.onRemove).toHaveBeenCalledOnce();
    expect(defaultProps.onRemove).toHaveBeenCalledWith(1); // slotIndex is 1
  });

  // ── Drag and Drop Event Wiring ──

  it('calls onDragStart with block id and slotIndex when dragging a filled slot', () => {
    render(<DropSlot {...defaultProps} slotIndex={2} block={mockBlock} />);

    // Find the draggable wrapper text element
    const draggableElement = screen.getByText('int main() {', {
      exact: false,
    }).parentElement!;

    fireEvent.dragStart(draggableElement);

    expect(defaultProps.onDragStart).toHaveBeenCalledOnce();
    expect(defaultProps.onDragStart).toHaveBeenCalledWith('block-123', 2);
  });

  it('calls onDragOver when an item is dragged over the slot', () => {
    const { container } = render(<DropSlot {...defaultProps} slotIndex={0} />);

    const slotElement = container.firstChild as HTMLElement;
    fireEvent.dragOver(slotElement);

    expect(defaultProps.onDragOver).toHaveBeenCalledOnce();
    // Verify it passes the slotIndex as the second arg
    expect(defaultProps.onDragOver).toHaveBeenCalledWith(expect.any(Object), 0);
  });

  it('calls onDrop when an item is dropped on the slot', () => {
    const { container } = render(<DropSlot {...defaultProps} slotIndex={4} />);

    const slotElement = container.firstChild as HTMLElement;
    fireEvent.drop(slotElement);

    expect(defaultProps.onDrop).toHaveBeenCalledOnce();
    expect(defaultProps.onDrop).toHaveBeenCalledWith(4);
  });

  it('calls onDragLeave when a dragged item leaves the slot', () => {
    const { container } = render(<DropSlot {...defaultProps} />);

    const slotElement = container.firstChild as HTMLElement;
    fireEvent.dragLeave(slotElement);

    expect(defaultProps.onDragLeave).toHaveBeenCalledOnce();
  });
});
