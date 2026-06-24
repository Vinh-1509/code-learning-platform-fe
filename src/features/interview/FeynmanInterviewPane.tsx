import { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { AutoResizeTextarea } from '@/components/ui/AutoResizeTextarea';
import { AIMessage, UserMessage } from './MessageBubbles';
import type { FeynmanMessage, FeynmanInterviewProps } from './feynmanTypes';
import { Loader2, ArrowRight, RotateCw } from 'lucide-react';
import {
  fetchFeynmanQuestion,
  fetchFeynmanHistory,
  sendFeynmanMessage,
} from '@/features/interview/api/feynman.api';
import type { FeynmanChatMessage } from '@/types/api/feynman.types';

// ---------------------------------------------------------------------------
// Map backend chat history → FeynmanMessage[]
// ---------------------------------------------------------------------------
function historyToMessages(history: FeynmanChatMessage[]): FeynmanMessage[] {
  return history.map((h, i) => ({
    id: `history-${i}`,
    role: h.role === 'assistant' ? 'ai' : 'user',
    content: h.content,
  }));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function FeynmanInterviewPane({
  lessonBlockId,
  onComplete,
  onNextBlock,
  hasNextBlock,
}: FeynmanInterviewProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<FeynmanMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isBlockComplete, setIsBlockComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializeSession = useCallback(async () => {
    try {
      setIsInitializing(true);
      setError(null);

      setMessages([]);
      setUserInput('');
      setIsBlockComplete(false);

      const { chatHistory, isFeynmanPassed } =
        await fetchFeynmanHistory(lessonBlockId);

      if (chatHistory.length > 0) {
        setMessages(historyToMessages(chatHistory));

        if (isFeynmanPassed) {
          setIsBlockComplete(true);
        }
      } else {
        const introMessage: FeynmanMessage = {
          id: 'intro',
          role: 'ai',
          content:
            'Excellent! You completed all the exercises. Now let me check if you truly understand the concept. 🎯',
        };

        const question = await fetchFeynmanQuestion(lessonBlockId);

        const questionMessage: FeynmanMessage = {
          id: 'q1',
          role: 'ai',
          content: question,
        };

        setMessages([introMessage, questionMessage]);
      }
    } catch (err) {
      if (axios.isAxiosError<{ message?: string }>(err)) {
        if (err.response?.status === 403) {
          setError(
            err.response.data?.message ||
              'Feynman is available only after the block is completed.'
          );
        } else {
          setError('Failed to load Feynman session. Please try again.');
        }
      } else {
        setError('Failed to load Feynman session. Please try again.');
      }

      console.error(err);
    } finally {
      setIsInitializing(false);
    }
  }, [lessonBlockId]);

  // -------------------------------------------------------------------------
  // On mount: restore session or start fresh
  // -------------------------------------------------------------------------
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void initializeSession();
  }, [initializeSession]);

  // -------------------------------------------------------------------------
  // Auto-scroll
  // -------------------------------------------------------------------------
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // -------------------------------------------------------------------------
  // Send message
  // -------------------------------------------------------------------------
  const handleSubmitResponse = async () => {
    const text = userInput.trim();
    if (!text || isLoading) return;

    const userMessage: FeynmanMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);
    setError(null);

    try {
      const result = await sendFeynmanMessage(lessonBlockId, text);

      const aiReply: FeynmanMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'ai',
        content: result.reply,
      };

      setMessages((prev) => [...prev, aiReply]);

      if (result.isPassed) {
        setIsBlockComplete(true);
        onComplete();
      }
    } catch (err) {
      if (axios.isAxiosError<{ message?: string }>(err)) {
        if (err.response?.status === 403) {
          setError(
            err.response.data?.message ||
              'Feynman is available only after the block is completed.'
          );
        } else {
          setError('Something went wrong. Please try again.');
        }
      } else {
        setError('Something went wrong. Please try again.');
      }
      console.error('Feynman chat error', err);
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className="flex flex-col h-full bg-card rounded-lg border border-border overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-codeblock-header border-b border-border flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
          <span className="text-xs font-bold text-white">🤖</span>
        </div>
        <span className="text-sm font-bold text-white">Feynman AI</span>
        {isBlockComplete && (
          <span className="ml-auto text-xs text-emerald-400 font-medium">
            ✓ Passed
          </span>
        )}
      </div>

      {/* Success Banner (top) */}
      {!isInitializing &&
        messages.length <= 2 &&
        !isBlockComplete &&
        !error && (
          <div className="mx-4 mt-4 p-3 bg-emerald-50 border border-emerald-300 rounded-lg">
            <p className="text-sm font-semibold text-emerald-800">
              ✓ All exercises complete!
            </p>
            <p className="text-xs text-emerald-700 mt-1">
              Now explain your reasoning to unlock the next block.
            </p>
          </div>
        )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {isInitializing ? (
          <div className="flex items-center justify-center h-full text-slate-400 gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading session…</span>
          </div>
        ) : (
          <>
            {messages.map((message) =>
              message.role === 'ai' ? (
                <AIMessage
                  key={message.id}
                  content={message.content}
                  isQuestion
                />
              ) : (
                <UserMessage key={message.id} content={message.content} />
              )
            )}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-3 mb-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">🤖</span>
                </div>
                <div className="flex-1">
                  <div className="rounded-xl p-3.5 bg-slate-100 border border-slate-200 inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                    <span className="text-sm text-slate-600">
                      AI is thinking…
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Inline error */}
            {error && (
              <div className="rounded-lg p-3 bg-rose-50 border border-rose-200">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-rose-700">{error}</p>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void initializeSession()}
                    disabled={isInitializing}
                  >
                    {isInitializing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <RotateCw className="w-4 h-4 mr-1" />
                        Retry
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Completion Banner */}
      {isBlockComplete && (
        <div className="mx-4 mb-4 p-4 bg-green-mint border border-success/30 rounded-lg">
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-sm font-bold text-green-foreground">
                🎉 Block Complete!
              </p>
              <p className="text-xs text-green-foreground/90 mt-1">
                {hasNextBlock
                  ? "You've demonstrated a solid understanding. Ready for the next block?"
                  : "You've completed all the blocks in this lesson! Excellent work! 🎓"}
              </p>
            </div>
            {hasNextBlock && (
              <Button
                onClick={onNextBlock}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-9 px-3 text-sm font-semibold flex items-center justify-center gap-1.5"
              >
                Next Block
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Input */}
      {!isBlockComplete && !isInitializing && !error && (
        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50">
          <div className="flex gap-2">
            <AutoResizeTextarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
                  e.preventDefault();
                  void handleSubmitResponse();
                }
              }}
              placeholder="Type your explanation…"
              disabled={isLoading}
              className="flex-1 px-3 py-1.5 text-sm border border-border rounded-lg
                        focus:outline-none focus:ring-2 focus:ring-primary
                        focus:border-transparent disabled:bg-muted
                        disabled:text-muted-foreground min-h-[36px] max-h-[200px]"
            />
            <Button
              onClick={() => void handleSubmitResponse()}
              disabled={isLoading || !userInput.trim()}
              className="bg-primary hover:bg-primary/90 text-white h-9 px-4 font-semibold flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Send
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
