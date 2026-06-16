import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AIMessage, UserMessage, FeedbackBadge } from './MessageBubbles';
import type { FeynmanMessage, FeynmanInterviewProps } from './feynmanTypes';
import { Loader2, ArrowRight } from 'lucide-react';

export function FeynmanInterviewPane({
  // _lessonBlockId,
  onComplete,
  onNextBlock,
  hasNextBlock,
}: FeynmanInterviewProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<FeynmanMessage[]>([
    {
      id: '1',
      role: 'ai',
      content:
        "Excellent! You completed all the exercises. Now, let me check if you truly understand the concept by asking you some questions. Let's start! 🎯",
    },
    {
      id: '2',
      role: 'ai',
      content:
        "You used a for loop here. Why did you choose a for loop instead of a while loop? What's the key difference that led to your choice?",
      isCorrect: undefined,
    },
  ]);

  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [isBlockComplete, setIsBlockComplete] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    isCorrect: boolean;
    message: string;
  } | null>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmitResponse = () => {
    if (!userInput.trim()) return;

    // Add user message
    const userMessage: FeynmanMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: userInput,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    // Simulate AI evaluation (replace with actual API call)
    setTimeout(() => {
      // For demo: first answer is wrong, subsequent answers are correct
      const isCorrect = currentQuestion > 1 ? true : false;

      if (isCorrect) {
        setFeedbackMessage({
          isCorrect: true,
          message: 'Your reasoning is spot on! That shows great understanding.',
        });

        // After correct answer, show next question or completion
        setTimeout(() => {
          if (currentQuestion < 3) {
            // Add next question
            const nextAIMessage: FeynmanMessage = {
              id: `msg-${Date.now()}`,
              role: 'ai',
              content:
                currentQuestion === 1
                  ? 'Great! Now, can you explain when you would use a while loop instead?'
                  : "Wonderful! You've demonstrated a strong understanding of loops. You're ready to move forward! 🚀",
            };

            setMessages((prev) => [...prev, nextAIMessage]);
            setCurrentQuestion((prev) => prev + 1);

            if (currentQuestion === 2) {
              setIsBlockComplete(true);
            }
          }

          setFeedbackMessage(null);
          setIsLoading(false);
        }, 1500);
      } else {
        // Show explanation for incorrect answer
        const explanation =
          currentQuestion === 1
            ? 'Actually, a for loop is typically used when you know the number of iterations beforehand, while a while loop is used when the number of iterations is unknown. Both could work here, but think about whether you knew exactly how many times to loop before you started.'
            : "Not quite. A while loop is used when you need to repeat code while a condition is true, but you don't know how many times it will execute upfront.";

        const feedbackAIMessage: FeynmanMessage = {
          id: `msg-${Date.now()}`,
          role: 'ai',
          content: explanation,
          isCorrect: false,
        };

        setMessages((prev) => [...prev, feedbackAIMessage]);

        setFeedbackMessage({
          isCorrect: false,
          message: explanation,
        });

        setTimeout(() => {
          const retryMessage: FeynmanMessage = {
            id: `msg-${Date.now()}`,
            role: 'ai',
            content:
              'Give it another try. Think about the key difference between knowing vs. not knowing the iteration count.',
          };

          setMessages((prev) => [...prev, retryMessage]);
          setFeedbackMessage(null);
          setIsLoading(false);
        }, 1000);

        setCurrentQuestion((prev) => prev + 1);
      }
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
          <span className="text-xs font-bold text-white">🤖</span>
        </div>
        <span className="text-sm font-bold text-white">Feynman AI</span>
        <span className="ml-auto text-xs text-slate-400">
          Question {currentQuestion}/3
        </span>
      </div>

      {/* Success Banner */}
      {messages.length === 2 && (
        <div className="mx-4 mt-4 p-3 bg-emerald-50 border border-emerald-300 rounded-lg">
          <p className="text-sm font-semibold text-emerald-800">
            ✓ All exercises complete!
          </p>
          <p className="text-xs text-emerald-700 mt-1">
            Now explain your reasoning to unlock the next block.
          </p>
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((message) => (
          <div key={message.id}>
            {message.role === 'ai' ? (
              <AIMessage
                content={message.content}
                isQuestion={!message.isCorrect}
                isFeedback={message.isCorrect === false}
              />
            ) : (
              <UserMessage content={message.content} />
            )}
          </div>
        ))}

        {/* Feedback Badge */}
        {feedbackMessage && (
          <FeedbackBadge
            isCorrect={feedbackMessage.isCorrect}
            message={feedbackMessage.message}
          />
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex gap-3 mb-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
              <span className="text-xs font-bold text-white">🤖</span>
            </div>
            <div className="flex-1">
              <div className="rounded-xl p-3.5 bg-slate-100 border border-slate-200 inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                <span className="text-sm text-slate-600">
                  AI is thinking...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Completion Banner */}
      {isBlockComplete && (
        <div className="mx-4 mb-4 p-4 bg-emerald-50 border border-emerald-300 rounded-lg">
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-sm font-bold text-emerald-800">
                🎉 Block Complete!
              </p>
              <p className="text-xs text-emerald-700 mt-1">
                {hasNextBlock
                  ? "You've demonstrated a solid understanding. Ready for the next block?"
                  : "You've completed all the blocks in this lesson! Excellent work! 🎓"}
              </p>
            </div>
            {hasNextBlock && (
              <Button
                onClick={() => {
                  onComplete();
                  onNextBlock();
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-9 px-3 text-sm font-semibold flex items-center justify-center gap-1.5"
              >
                Next Block
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Input Area */}
      {!isBlockComplete && (
        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50">
          <div className="flex gap-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
                  void handleSubmitResponse();
                }
              }}
              placeholder="Type your explanation..."
              disabled={isLoading}
              className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 disabled:text-slate-500"
            />
            <Button
              onClick={() => void handleSubmitResponse()}
              disabled={isLoading || !userInput.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-4 font-semibold flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
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
