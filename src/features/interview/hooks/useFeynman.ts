import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import {
  fetchFeynmanHistory,
  fetchFeynmanQuestion,
  sendFeynmanMessage,
} from '../api/feynman.api';
import type { FeynmanQuestionResponse } from '@/types/api/feynman.types';

/**
 * Normalized structure for the localized Feynman session state stored within React Query cache.
 */
interface ValidatedSessionCache {
  isPassed: boolean;
  messages: {
    id: string;
    role: 'ai' | 'user';
    content: string;
  }[];
}

/**
 * Custom hook to manage fetching and structuring active Feynman interview dialogues.
 */
export function useFeynmanSession(lessonBlockId: string) {
  return useQuery<ValidatedSessionCache, Error>({
    queryKey: queryKeys.feynman.history(lessonBlockId),
    queryFn: async () => {
      const historyData = await fetchFeynmanHistory(lessonBlockId);
      const chatHistory = historyData.chatHistory || [];
      const isFeynmanPassed = historyData.isFeynmanPassed || false;

      if (chatHistory.length > 0) {
        return {
          messages: chatHistory.map((h, i) => ({
            id: `history-${i}`,
            role: h.role === 'assistant' ? ('ai' as const) : ('user' as const),
            content: h.content,
          })),
          isPassed: isFeynmanPassed,
        };
      }

      const introContent =
        'Excellent! You completed all the exercises. Now let me check if you truly understand the concept. 🎯';

      // Explicitly type-cast or infer the exact backend API structure to remove unsafe 'any' assertions
      const questionContent: string | FeynmanQuestionResponse =
        await fetchFeynmanQuestion(lessonBlockId);

      return {
        messages: [
          { id: 'intro', role: 'ai' as const, content: introContent },
          {
            id: 'q1',
            role: 'ai' as const,
            content:
              typeof questionContent === 'string'
                ? questionContent
                : (questionContent as FeynmanQuestionResponse).question,
          },
        ],
        isPassed: false,
      };
    },
    enabled: Boolean(lessonBlockId),
    staleTime: 0,
    gcTime: 0,
  });
}

/**
 * Custom hook managing structural transactional updates for ongoing Feynman chat instances.
 */
export function useSendFeynmanMessage(lessonBlockId: string, lessonId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    Awaited<ReturnType<typeof sendFeynmanMessage>>,
    Error,
    { content: string }
  >({
    mutationFn: ({ content }) => sendFeynmanMessage(lessonBlockId, content),
    onSuccess: (result, variables) => {
      const historyKey = queryKeys.feynman.history(lessonBlockId);
      const previousSession =
        queryClient.getQueryData<ValidatedSessionCache>(historyKey);

      if (previousSession) {
        // Fast path: append directly into cache, no extra network round-trip.
        queryClient.setQueryData<ValidatedSessionCache>(historyKey, {
          isPassed: result.isPassed,
          messages: [
            ...previousSession.messages,
            {
              id: `user-${Date.now()}`,
              role: 'user' as const,
              content: variables.content,
            },
            {
              id: `ai-${Date.now() + 1}`,
              role: 'ai' as const,
              content: result.reply,
            },
          ],
        });
      } else {
        void queryClient.invalidateQueries({ queryKey: historyKey });
      }

      void queryClient.invalidateQueries({
        queryKey: queryKeys.feynman.stats(lessonBlockId),
      });

      // ── On pass only: lesson block status, roadmap progress, and dashboard ─
      if (result.isPassed) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.lessons.detail(lessonId),
        });
        void queryClient.invalidateQueries({
          queryKey: queryKeys.milestones.all,
        });
        void queryClient.invalidateQueries({
          queryKey: queryKeys.dashboard.all,
        });
      }
    },
  });
}
