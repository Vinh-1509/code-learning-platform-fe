import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CurrentLessonBanner } from '@/features/dashboard/CurrentLessonBanner';

describe('CurrentLessonBanner', () => {
  const mockProps = {
    lessonId: 'lesson-42',
    lessonName: 'Advanced Memory Management',
    moduleName: 'Module 3: C++ Internals',
    progress: 75.6, // Using a decimal to test rounding logic
    onStartLesson: vi.fn(),
  };

  it('renders the lesson details, module name, and calculated progress accurately', () => {
    render(<CurrentLessonBanner {...mockProps} />);

    // Verify textual content
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Advanced Memory Management'
    );
    expect(screen.getByText('Module 3: C++ Internals')).toBeInTheDocument();
    expect(screen.getByText('In progress')).toBeInTheDocument();

    // Verify the progress is rounded using toFixed(0) -> 75.6 becomes 76
    expect(screen.getByText('76% Completed')).toBeInTheDocument();
  });

  it('calls onStartLesson with the correct lessonId when the "Continue lesson" button is clicked', async () => {
    const user = userEvent.setup();
    render(<CurrentLessonBanner {...mockProps} />);

    // Target the specific button by its accessible name (ignoring the chevron icons which are also buttons)
    const continueButton = screen.getByRole('button', {
      name: /continue lesson/i,
    });

    await user.click(continueButton);

    expect(mockProps.onStartLesson).toHaveBeenCalledOnce();
    expect(mockProps.onStartLesson).toHaveBeenCalledWith('lesson-42');
  });
});
