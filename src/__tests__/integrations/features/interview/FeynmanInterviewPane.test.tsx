import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import { FeynmanInterviewPane } from '@/features/interview/FeynmanInterviewPane';
import { server } from '../../../mocks/server';

// jsdom doesn't support scrollIntoView, so mock it here
// to prevent UI components from crashing during tests.
window.HTMLElement.prototype.scrollIntoView = vi.fn();

// ── Constants ─────────────────────────────────────────────────────────────────

// Matches the default MSW handler in handlers.ts
const DEFAULT_QUESTION = 'Explain this concept in your own words.';
// Matches the default MSW chat handler
const DEFAULT_CHAT_REPLY = 'Good explanation! You got it.';
// Matches the literal string in the component
const INIT_ERROR_MSG = 'Failed to load Feynman session. Please try again.';
const CHAT_ERROR_MSG = 'Something went wrong. Please try again.';
const BLOCK_COMPLETE_403_MSG =
  'Feynman is available only after the block is completed.';

// ── Helpers ───────────────────────────────────────────────────────────────────

const defaultProps = {
  lessonBlockId: 'block-test',
  onComplete: vi.fn(),
  onNextBlock: vi.fn(),
  onBackToDashboard: vi.fn(),
  hasNextBlock: true,
};

/**
 * Waits until the "Loading session…" spinner is gone.
 * The component sets isInitializing=true on mount; once both the history
 * and question fetches resolve it flips to false.
 */
async function waitForInit() {
  await waitFor(() => {
    expect(screen.queryByText(/loading session/i)).not.toBeInTheDocument();
  });
}

// ── Suite ─────────────────────────────────────────────────────────────────────

describe('FeynmanInterviewPane', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Suppress the internal console.error calls the component makes on failures
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── Initialization ──────────────────────────────────────────────────────────

  describe('initialization', () => {
    it('shows the loading spinner while fetching history and question', () => {
      // Keep the history request pending so init never completes
      server.use(
        http.get('*/api/feynman/block/*/history', () => new Promise(() => {}))
      );

      render(<FeynmanInterviewPane {...defaultProps} />);

      expect(screen.getByText(/loading session/i)).toBeInTheDocument();
    });

    it('shows the intro message and question for a fresh session (empty history)', async () => {
      // Default handlers: chatHistory=[], isFeynmanPassed=false → fetches question
      render(<FeynmanInterviewPane {...defaultProps} />);

      await waitForInit();

      // The hardcoded intro message
      expect(
        screen.getByText(/excellent.*completed all the exercises/i)
      ).toBeInTheDocument();
      // Question returned by the default MSW handler
      expect(screen.getByText(DEFAULT_QUESTION)).toBeInTheDocument();
    });

    it('shows the "All exercises complete" success banner on a fresh session', async () => {
      render(<FeynmanInterviewPane {...defaultProps} />);

      await waitForInit();

      expect(screen.getByText('✓ All exercises complete!')).toBeInTheDocument();
      expect(
        screen.getByText(/explain your reasoning to unlock the next block/i)
      ).toBeInTheDocument();
    });

    it('restores prior chat history when the session has existing messages', async () => {
      server.use(
        http.get('*/api/feynman/block/*/history', () =>
          HttpResponse.json({
            blockId: 'block-test',
            chatHistory: [
              {
                role: 'assistant',
                content: 'Can you explain what a pointer is?',
              },
              { role: 'user', content: 'A pointer stores a memory address.' },
            ],
          })
        )
      );

      render(<FeynmanInterviewPane {...defaultProps} />);

      await waitForInit();

      expect(
        screen.getByText('Can you explain what a pointer is?')
      ).toBeInTheDocument();
      expect(
        screen.getByText('A pointer stores a memory address.')
      ).toBeInTheDocument();
    });

    it('shows the completion banner immediately when isFeynmanPassed=true in history', async () => {
      server.use(
        http.get('*/api/feynman/block/*/history', () =>
          HttpResponse.json({
            blockId: 'block-test',
            chatHistory: [
              { role: 'assistant', content: 'Great work, you passed!' },
            ],
          })
        ),
        http.get('*/api/feynman/block/*/stats', () =>
          HttpResponse.json({ blockId: 'block-test', isFeynmanPassed: true })
        )
      );

      render(<FeynmanInterviewPane {...defaultProps} />);

      await waitForInit();

      // Completion banner
      expect(screen.getByText('🎉 Block Complete!')).toBeInTheDocument();
      // Header badge
      expect(screen.getByText('✓ Passed')).toBeInTheDocument();
      // Input area should be hidden
      expect(
        screen.queryByPlaceholderText(/type your explanation/i)
      ).not.toBeInTheDocument();
    });
  });

  // ── Sending messages ────────────────────────────────────────────────────────

  describe('sending messages', () => {
    it('renders the user message and the AI reply after a successful send', async () => {
      const user = userEvent.setup();

      server.use(
        http.post('*/api/feynman/block/*/chat', () =>
          HttpResponse.json({
            blockId: 'block-test',
            reply: 'Good explanation, keep going.',
            isPassed: false,
          })
        )
      );

      render(<FeynmanInterviewPane {...defaultProps} />);
      await waitForInit();

      await user.type(
        screen.getByPlaceholderText(/type your explanation/i),
        'A loop repeats a block of code.'
      );
      await user.click(screen.getByRole('button', { name: /send/i }));

      await waitFor(() => {
        expect(
          screen.getByText('Good explanation, keep going.')
        ).toBeInTheDocument();
      });
      // User message should also appear
      expect(
        screen.getByText('A loop repeats a block of code.')
      ).toBeInTheDocument();
    });

    it('clears the textarea after the message is sent', async () => {
      const user = userEvent.setup();

      server.use(
        http.post('*/api/feynman/block/*/chat', () =>
          HttpResponse.json({
            blockId: 'block-test',
            reply: 'OK',
            isPassed: false,
          })
        )
      );

      render(<FeynmanInterviewPane {...defaultProps} />);
      await waitForInit();

      const input = screen.getByPlaceholderText(/type your explanation/i);
      await user.type(input, 'My answer.');
      await user.click(screen.getByRole('button', { name: /send/i }));

      await waitFor(() => expect(input).toHaveValue(''));
    });

    it('shows "AI is thinking…" and disables the textarea while the reply is pending', async () => {
      const user = userEvent.setup();
      let resolveChat!: (value: Response) => void;

      server.use(
        http.post(
          '*/api/feynman/block/*/chat',
          () =>
            new Promise<Response>((resolve) => {
              resolveChat = resolve;
            })
        )
      );

      render(<FeynmanInterviewPane {...defaultProps} />);
      await waitForInit();

      const input = screen.getByPlaceholderText(/type your explanation/i);
      await user.type(input, 'My answer.');
      await user.click(screen.getByRole('button', { name: /send/i }));

      // Pending state: loading indicator visible, textarea locked
      expect(screen.getByText(/AI is thinking/i)).toBeInTheDocument();
      expect(input).toBeDisabled();

      // Resolve to clean up
      resolveChat(
        HttpResponse.json({
          blockId: 'block-test',
          reply: 'Thanks',
          isPassed: false,
        })
      );

      await waitFor(() => {
        expect(screen.queryByText(/AI is thinking/i)).not.toBeInTheDocument();
        expect(input).not.toBeDisabled();
      });
    });

    it('keeps the Send button disabled when the textarea is empty', async () => {
      render(<FeynmanInterviewPane {...defaultProps} />);
      await waitForInit();

      expect(screen.getByRole('button', { name: /send/i })).toBeDisabled();
    });

    it('submits the message when the user presses Enter (without Shift)', async () => {
      const user = userEvent.setup();

      server.use(
        http.post('*/api/feynman/block/*/chat', () =>
          HttpResponse.json({
            blockId: 'block-test',
            reply: 'Got it.',
            isPassed: false,
          })
        )
      );

      render(<FeynmanInterviewPane {...defaultProps} />);
      await waitForInit();

      await user.type(
        screen.getByPlaceholderText(/type your explanation/i),
        'Enter-key answer.'
      );
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText('Got it.')).toBeInTheDocument();
      });
    });

    it('does NOT submit when the user presses Shift+Enter (input retains its value)', async () => {
      const user = userEvent.setup();

      render(<FeynmanInterviewPane {...defaultProps} />);
      await waitForInit();

      const input = screen.getByPlaceholderText(/type your explanation/i);
      await user.type(input, 'First line.');
      await user.keyboard('{Shift>}{Enter}{/Shift}');

      // If submit had fired, the input would have been cleared and the default
      // chat reply would appear. Neither should be true here.
      expect(input).not.toHaveValue('');
      expect(screen.queryByText(DEFAULT_CHAT_REPLY)).not.toBeInTheDocument();
    });
  });

  // ── Completion flow ─────────────────────────────────────────────────────────

  describe('completion flow', () => {
    // Helper: init, type, and send a message with the default handler (isPassed=true)
    async function triggerCompletion(user: ReturnType<typeof userEvent.setup>) {
      render(<FeynmanInterviewPane {...defaultProps} />);
      await waitForInit();

      await user.type(
        screen.getByPlaceholderText(/type your explanation/i),
        'My answer.'
      );
      await user.click(screen.getByRole('button', { name: /send/i }));

      await waitFor(() =>
        expect(screen.getByText('🎉 Block Complete!')).toBeInTheDocument()
      );
    }

    it('shows the completion banner and calls onComplete when isPassed=true', async () => {
      const user = userEvent.setup();
      // Default chat handler returns isPassed=true
      await triggerCompletion(user);

      expect(defaultProps.onComplete).toHaveBeenCalledOnce();
    });

    it('hides the input area once the block is marked complete', async () => {
      const user = userEvent.setup();
      await triggerCompletion(user);

      expect(
        screen.queryByPlaceholderText(/type your explanation/i)
      ).not.toBeInTheDocument();
    });

    it('shows the "Next Block" button when hasNextBlock=true', async () => {
      const user = userEvent.setup();
      // defaultProps already has hasNextBlock=true
      await triggerCompletion(user);

      expect(
        screen.getByRole('button', { name: /next block/i })
      ).toBeInTheDocument();
    });

    it('calls onNextBlock when the "Next Block" button is clicked', async () => {
      const user = userEvent.setup();
      await triggerCompletion(user);

      await user.click(screen.getByRole('button', { name: /next block/i }));

      expect(defaultProps.onNextBlock).toHaveBeenCalledOnce();
    });

    it('hides "Next Block" and shows the all-done message when hasNextBlock=false', async () => {
      const user = userEvent.setup();

      render(<FeynmanInterviewPane {...defaultProps} hasNextBlock={false} />);
      await waitForInit();

      await user.type(
        screen.getByPlaceholderText(/type your explanation/i),
        'My answer.'
      );
      await user.click(screen.getByRole('button', { name: /send/i }));

      await waitFor(() =>
        expect(screen.getByText('🎉 Block Complete!')).toBeInTheDocument()
      );

      expect(
        screen.queryByRole('button', { name: /next block/i })
      ).not.toBeInTheDocument();
      expect(
        screen.getByText(/completed all the blocks in this lesson/i)
      ).toBeInTheDocument();
    });
  });

  // ── Error handling ──────────────────────────────────────────────────────────

  describe('error handling — initialization', () => {
    it('shows the 403 server message when the block is not yet accessible', async () => {
      server.use(
        http.get('*/api/feynman/block/*/history', () =>
          HttpResponse.json(
            { message: BLOCK_COMPLETE_403_MSG },
            { status: 403 }
          )
        )
      );

      render(<FeynmanInterviewPane {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(BLOCK_COMPLETE_403_MSG)).toBeInTheDocument();
      });
    });

    it('shows the generic error message for non-403 init failures', async () => {
      server.use(
        http.get('*/api/feynman/block/*/history', () => HttpResponse.error())
      );

      render(<FeynmanInterviewPane {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(INIT_ERROR_MSG)).toBeInTheDocument();
      });
    });

    it('shows the Retry button when initialization fails', async () => {
      server.use(
        http.get('*/api/feynman/block/*/history', () => HttpResponse.error())
      );

      render(<FeynmanInterviewPane {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /retry/i })
        ).toBeInTheDocument();
      });
      // Input must also be hidden while in error state
      expect(
        screen.queryByPlaceholderText(/type your explanation/i)
      ).not.toBeInTheDocument();
    });

    it('re-initializes the session successfully when Retry is clicked', async () => {
      const user = userEvent.setup();

      server.use(
        http.get('*/api/feynman/block/*/history', () => HttpResponse.error())
      );

      render(<FeynmanInterviewPane {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /retry/i })
        ).toBeInTheDocument();
      });

      // Swap to a successful handler before the user clicks retry
      server.use(
        http.get('*/api/feynman/block/*/history', () =>
          HttpResponse.json({ blockId: 'block-test', chatHistory: [] })
        )
      );

      await user.click(screen.getByRole('button', { name: /retry/i }));

      await waitFor(() => {
        expect(screen.getByText(DEFAULT_QUESTION)).toBeInTheDocument();
      });
      expect(
        screen.queryByRole('button', { name: /retry/i })
      ).not.toBeInTheDocument();
    });
  });

  describe('error handling — chat', () => {
    it('shows an inline error message when a chat request fails', async () => {
      const user = userEvent.setup();

      server.use(
        http.post('*/api/feynman/block/*/chat', () => HttpResponse.error())
      );

      render(<FeynmanInterviewPane {...defaultProps} />);
      await waitForInit();

      await user.type(
        screen.getByPlaceholderText(/type your explanation/i),
        'My answer.'
      );
      await user.click(screen.getByRole('button', { name: /send/i }));

      await waitFor(() => {
        expect(screen.getByText(CHAT_ERROR_MSG)).toBeInTheDocument();
      });
    });

    it('shows the Retry button after a chat failure and hides the input', async () => {
      const user = userEvent.setup();

      server.use(
        http.post('*/api/feynman/block/*/chat', () => HttpResponse.error())
      );

      render(<FeynmanInterviewPane {...defaultProps} />);
      await waitForInit();

      await user.type(
        screen.getByPlaceholderText(/type your explanation/i),
        'My answer.'
      );
      await user.click(screen.getByRole('button', { name: /send/i }));

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /retry/i })
        ).toBeInTheDocument();
      });
      // The input area is hidden when error is set
      expect(
        screen.queryByPlaceholderText(/type your explanation/i)
      ).not.toBeInTheDocument();
    });

    it('re-initializes the whole session (not just the last message) when Retry is clicked after a chat failure', async () => {
      const user = userEvent.setup();

      server.use(
        http.post('*/api/feynman/block/*/chat', () => HttpResponse.error())
      );

      render(<FeynmanInterviewPane {...defaultProps} />);
      await waitForInit();

      await user.type(
        screen.getByPlaceholderText(/type your explanation/i),
        'My answer.'
      );
      await user.click(screen.getByRole('button', { name: /send/i }));

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /retry/i })
        ).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /retry/i }));

      // initializeSession() is called: loading indicator appears, then resolves
      // with the intro + question (fresh session from default handlers)
      await waitFor(() => {
        expect(screen.getByText(DEFAULT_QUESTION)).toBeInTheDocument();
      });
      expect(screen.queryByText(CHAT_ERROR_MSG)).not.toBeInTheDocument();
    });

    it('shows the 403 server message when a chat reply is blocked', async () => {
      const user = userEvent.setup();

      server.use(
        http.post('*/api/feynman/block/*/chat', () =>
          HttpResponse.json(
            { message: BLOCK_COMPLETE_403_MSG },
            { status: 403 }
          )
        )
      );

      render(<FeynmanInterviewPane {...defaultProps} />);
      await waitForInit();

      await user.type(
        screen.getByPlaceholderText(/type your explanation/i),
        'My answer.'
      );
      await user.click(screen.getByRole('button', { name: /send/i }));

      await waitFor(() => {
        expect(screen.getByText(BLOCK_COMPLETE_403_MSG)).toBeInTheDocument();
      });
    });
  });
});
