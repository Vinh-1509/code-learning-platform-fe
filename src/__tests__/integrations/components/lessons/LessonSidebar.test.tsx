import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { LessonSidebar } from '@/features/lesson/LessonSidebar';
import type { Block } from '@/types/api/learning.types';

// ── Mock Data ──

const mockBlocks: Block[] = [
  {
    _id: 'block-1',
    title: 'Introduction to C++',
    description: 'Learn the basics of compilation',
    content: [],
    feynmanQuestion: 'Explain C++ compilation.',
    status: 'completed',
    isFeynmanPassed: true, // Should show the checkmark ✓
  },
  {
    _id: 'block-2',
    title: 'Variables and Types',
    description: '', // Testing missing description
    content: [],
    feynmanQuestion: 'What are primitive types?',
    status: 'active',
    isFeynmanPassed: false, // Should show the standard dot ●
  },
  {
    _id: 'block-3',
    title: '', // Testing empty title fallback to lessonTitle
    description: 'Advanced pointer arithmetic',
    content: [],
    feynmanQuestion: 'Explain pointers.',
    status: 'locked',
    isFeynmanPassed: false, // Should show the lock 🔒
  },
];

describe('LessonSidebar', () => {
  it('renders all blocks with their titles, descriptions, and sequence numbers', () => {
    render(
      <LessonSidebar
        blocks={mockBlocks}
        selectedBlockId="block-1"
        onSelectBlock={vi.fn()}
      />
    );

    // Block 1
    expect(screen.getByText('Block 1')).toBeInTheDocument();
    expect(screen.getByText('Introduction to C++')).toBeInTheDocument();
    expect(
      screen.getByText('Learn the basics of compilation')
    ).toBeInTheDocument();

    // Block 2
    expect(screen.getByText('Block 2')).toBeInTheDocument();
    expect(screen.getByText('Variables and Types')).toBeInTheDocument();

    // Block 3
    expect(screen.getByText('Block 3')).toBeInTheDocument();
  });

  it('falls back to lessonTitle when a block has no title', () => {
    render(
      <LessonSidebar
        blocks={mockBlocks}
        lessonTitle="Fallback Lesson Name"
        selectedBlockId="block-1"
        onSelectBlock={vi.fn()}
      />
    );

    // Block 3 has an empty title string, so it should render the lessonTitle
    expect(screen.getByText('Fallback Lesson Name')).toBeInTheDocument();
  });

  it('displays the correct status icons based on lock/pass state', () => {
    render(
      <LessonSidebar
        blocks={mockBlocks}
        selectedBlockId="block-1"
        onSelectBlock={vi.fn()}
      />
    );

    // completed + isFeynmanPassed
    expect(screen.getByText('✓')).toBeInTheDocument();
    // active / standard state
    expect(screen.getByText('●')).toBeInTheDocument();
    // locked state
    expect(screen.getByText('🔒')).toBeInTheDocument();
  });

  it('applies the selected background highlight to the active block', () => {
    render(
      <LessonSidebar
        blocks={mockBlocks}
        selectedBlockId="block-1"
        onSelectBlock={vi.fn()}
      />
    );

    const selectedBlockText = screen.getByText('Introduction to C++');
    const container = selectedBlockText.closest('.relative.flex.items-center');

    // Verifying Tailwind class application for selected state
    expect(container).toHaveClass('bg-primary-second');
  });

  it('calls onSelectBlock and onClose when an unlocked block is clicked', async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();
    const handleClose = vi.fn();

    render(
      <LessonSidebar
        blocks={mockBlocks}
        selectedBlockId="block-1"
        onSelectBlock={handleSelect}
        onClose={handleClose}
      />
    );

    // Click on Block 2 (unlocked)
    await user.click(screen.getByText('Variables and Types'));

    expect(handleSelect).toHaveBeenCalledWith('block-2');
    expect(handleClose).toHaveBeenCalledOnce();
  });

  it('does NOT call onSelectBlock when a locked block is clicked', async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();

    render(
      <LessonSidebar
        blocks={mockBlocks}
        lessonTitle="Fallback Name" // Needed for Block 3's empty title
        selectedBlockId="block-1"
        onSelectBlock={handleSelect}
      />
    );

    // Click on Block 3 (locked)
    await user.click(screen.getByText('Fallback Name'));

    expect(handleSelect).not.toHaveBeenCalled();
  });

  it('renders the mobile overlay when isOpen=true and fires onClose when overlay is clicked', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();

    const { container } = render(
      <LessonSidebar
        blocks={mockBlocks}
        selectedBlockId="block-1"
        onSelectBlock={vi.fn()}
        isOpen={true}
        onClose={handleClose}
      />
    );

    // Find the overlay by its structural classes (since it's an empty div acting as a backdrop)
    const overlay = container.querySelector('.bg-black\\/40');
    expect(overlay).toBeInTheDocument();

    if (overlay) {
      await user.click(overlay);
    }

    expect(handleClose).toHaveBeenCalledOnce();
  });

  it('translates the aside into view when isOpen is true', () => {
    render(
      <LessonSidebar
        blocks={mockBlocks}
        selectedBlockId="block-1"
        onSelectBlock={vi.fn()}
        isOpen={true}
      />
    );

    const aside = screen.getByRole('complementary'); // <aside> naturally maps to 'complementary'
    expect(aside).toHaveClass('translate-x-0');
    expect(aside).not.toHaveClass('-translate-x-full');
  });
});
