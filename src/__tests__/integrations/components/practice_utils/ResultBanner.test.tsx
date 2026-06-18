import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

import { ResultBanner } from '@/components/practice_utils/shared/ResultBanner';

describe('ResultBanner', () => {
  beforeEach(() => {
    // ResultBanner logs to console during render — silence it in tests
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('renders nothing when showResult is null', () => {
    const { container } = render(
      <ResultBanner showResult={null} explanationStatus={{ status: 'idle' }} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('shows the correct answer banner', () => {
    render(
      <ResultBanner
        showResult="correct"
        explanationStatus={{ status: 'idle' }}
      />
    );

    expect(screen.getByText(/correct answer/i)).toBeInTheDocument();
  });

  it('shows the wrong answer banner', () => {
    render(
      <ResultBanner showResult="wrong" explanationStatus={{ status: 'idle' }} />
    );

    expect(screen.getByText(/incorrect/i)).toBeInTheDocument();
  });

  it('shows AI explanation loading state for wrong answers', () => {
    render(
      <ResultBanner
        showResult="wrong"
        explanationStatus={{ status: 'loading' }}
      />
    );

    expect(screen.getByText(/analyzing/i)).toBeInTheDocument();
  });

  it('shows AI explanation error message', () => {
    render(
      <ResultBanner
        showResult="wrong"
        explanationStatus={{ status: 'error' }}
      />
    );

    expect(
      screen.getByText(/failed to generate ai explanation/i)
    ).toBeInTheDocument();
  });

  it('shows AI feedback when explanation loads successfully', () => {
    render(
      <ResultBanner
        showResult="wrong"
        explanationStatus={{ status: 'success' }}
        explanation={{
          exerciseId: 'exercise-1',
          isCorrect: false,
          feedback: 'You picked the wrong loop type.',
          items: [],
          suggestion: 'Remember: while checks the condition first.',
        }}
      />
    );

    expect(
      screen.getByText('You picked the wrong loop type.')
    ).toBeInTheDocument();
    expect(
      screen.getByText(/while checks the condition first/i)
    ).toBeInTheDocument();
  });
});
