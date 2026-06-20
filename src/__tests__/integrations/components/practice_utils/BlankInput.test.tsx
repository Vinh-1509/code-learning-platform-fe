import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock the utilities so we can verify BlankInput coordinates with them correctly
vi.mock('@/components/practice_utils/utils/fillBlank.utils', () => ({
  getBlankInputClass: vi.fn(() => 'test-input-styling-class'),
  getInputWidth: vi.fn(() => 125),
}));

import { BlankInput } from '@/components/practice_utils/components/fill_blank/BlankInput';
import {
  getBlankInputClass,
  getInputWidth,
} from '@/components/practice_utils/utils/fillBlank.utils';

describe('BlankInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with the correct controlled value, placeholder, and computed width/classes', () => {
    const defaultProps = {
      partId: 'part-1',
      answer: 'const',
      onAnswerChange: vi.fn(),
    };

    render(<BlankInput {...defaultProps} />);

    const input = screen.getByRole('textbox');

    // Verify properties on the input
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('const'); // Using matching jest-dom matcher for values
    expect(input).toHaveAttribute('placeholder', '[part-1]');

    // Verify utility functions were invoked with the correct arguments
    expect(getBlankInputClass).toHaveBeenCalledWith('const');
    expect(getInputWidth).toHaveBeenCalledWith('const', '[part-1]');

    // Verify the values returned from our mocked utilities are applied
    expect(input).toHaveClass('test-input-styling-class');
    expect(input).toHaveStyle({ width: '125px' });
  });

  it('renders correctly when the answer is empty', () => {
    const defaultProps = {
      partId: '2',
      answer: '',
      onAnswerChange: vi.fn(),
    };

    render(<BlankInput {...defaultProps} />);

    const input = screen.getByRole('textbox');

    expect(input).toHaveValue('');
    expect(input).toHaveAttribute('placeholder', '[2]');
    expect(getBlankInputClass).toHaveBeenCalledWith('');
    expect(getInputWidth).toHaveBeenCalledWith('', '[2]');
  });

  it('calls onAnswerChange with the proper partId and character when the user types', async () => {
    const user = userEvent.setup();
    const handleAnswerChange = vi.fn();

    const defaultProps = {
      partId: 'dynamic-slot',
      answer: '',
      onAnswerChange: handleAnswerChange,
    };

    render(<BlankInput {...defaultProps} />);
    const input = screen.getByRole('textbox');

    // Simulate typing a character into the field
    await user.type(input, 'x');

    // Assert that the state updater prop was triggered with context
    expect(handleAnswerChange).toHaveBeenCalledOnce();
    expect(handleAnswerChange).toHaveBeenCalledWith('dynamic-slot', 'x');
  });
});
