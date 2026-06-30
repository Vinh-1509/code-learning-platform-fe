import { useState, useRef, useEffect, useMemo } from 'react';
import Axios from 'axios';
import { Button } from '@/components/ui/button';
import { AutoResizeTextarea } from '@/components/ui/AutoResizeTextarea';
import { AIMessage, UserMessage } from './MessageBubbles';
import { Loader2, ArrowRight, RotateCw } from 'lucide-react';
import {
  useFeynmanSession,
  useSendFeynmanMessage,
} from '@/features/interview/hooks/useFeynman';
import type { FeynmanInterviewProps } from './feynmanTypes';

export function FeynmanInterviewPane({
  lessonBlockId,
  lessonId,
  onComplete,
  onNextBlock,
  hasNextBlock,
}: FeynmanInterviewProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [userInput, setUserInput] = useState('');
  const [customError, setCustomError] = useState<string | null>(null);

  // ── Source of Truth Stream Extraction ──────────────────────────────────────
  const {
    data: sessionData,
    isLoading: isInitializing,
    error: queryError,
    refetch,
  } = useFeynmanSession(lessonBlockId);

  const { mutateAsync: sendMessage, isPending: isLoading } =
    useSendFeynmanMessage(lessonBlockId, lessonId);

  // Direct extraction avoids state sync discrepancies or unexpected UI shifts
  const messages = useMemo(
    () => sessionData?.messages || [],
    [sessionData?.messages]
  );
  const isBlockComplete = sessionData?.isPassed || false;

  // Intercept completion flags upstream to the core context wrapper
  useEffect(() => {
    if (sessionData?.isPassed) {
      onComplete();
    }
  }, [sessionData?.isPassed, onComplete]);

  // Maintain fluid interface dynamics by forcing an autoscroll on message delta modifications
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // ── Error Boundary Payload Computation ────────────────────────────────────
  let errorMessage: string | null = null;

  if (queryError) {
    if (Axios.isAxiosError<{ message?: string }>(queryError)) {
      const status = queryError.response?.status;
      const backendMessage = queryError.response?.data?.message;
      errorMessage =
        status === 403
          ? (backendMessage ??
            'Feynman is available only after the block is completed.')
          : 'Failed to process Feynman session. Please try again.';
    } else {
      errorMessage = queryError.message;
    }
  } else if (customError) {
    errorMessage = customError;
  }

  const handleSubmitResponse = async () => {
    const text = userInput.trim();
    if (!text || isLoading) return;

    setUserInput('');
    setCustomError(null);

    try {
      await sendMessage({ content: text });
    } catch (err) {
      if (Axios.isAxiosError<{ message?: string }>(err)) {
        const status = err.response?.status;
        const backendMessage = err.response?.data?.message;

        if (status === 429) {
          setCustomError(
            backendMessage ??
              'Too many failed attempts. Please try again later.'
          );
        } else if (status === 403) {
          setCustomError(
            backendMessage ??
              'Feynman is available only after the block is completed.'
          );
        } else {
          setCustomError(
            'Failed to process Feynman session. Please try again.'
          );
        }
      } else {
        setCustomError(
          err instanceof Error
            ? err.message
            : 'Something went wrong. Please try again.'
        );
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-lg border border-border overflow-hidden">
      {/* Header Viewport */}
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

      {/* Intro Onboarding Alert Frame */}
      {!isInitializing &&
        messages.length <= 2 &&
        !isBlockComplete &&
        !errorMessage && (
          <div className="mx-4 mt-4 p-3 bg-emerald-50 border border-emerald-300 rounded-lg">
            <p className="text-sm font-semibold text-emerald-800">
              ✓ All exercises complete!
            </p>
            <p className="text-xs text-emerald-700 mt-1">
              Now explain your reasoning to unlock the next block.
            </p>
          </div>
        )}

      {/* Main Dialogue Scroll Frame */}
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

            {errorMessage && (
              <div className="rounded-lg p-3 bg-rose-50 border border-rose-200">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-rose-700">{errorMessage}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void refetch()}
                  >
                    <RotateCw className="w-4 h-4 mr-1" /> Retry
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Session Milestone Advancement Section */}
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
                Next Block <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Interactive Response Terminal Console */}
      {!isBlockComplete && !isInitializing && !errorMessage && (
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
              className="flex-1 px-3 py-1.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-muted disabled:text-muted-foreground min-h-[36px] max-h-[60px]"
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
                  Send <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
