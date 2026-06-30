import { api } from '@/lib/axios';
import {
  FeynmanQuestionResponseSchema,
  FeynmanHistoryResponseSchema,
  FeynmanStatsResponseSchema,
  FeynmanChatResponseSchema,
  type FeynmanChatMessage,
  type FeynmanChatResponse,
} from '../interview.schema';

/**
 * Fetches the AI generated interview question tailored to a precise lesson block.
 */
export async function fetchFeynmanQuestion(blockId: string): Promise<string> {
  // Use <unknown> to eliminate unsafe-assignment lint rules on destructured data
  const { data } = await api.get<unknown>(
    `/api/feynman/block/${blockId}/question`
  );
  const validated = FeynmanQuestionResponseSchema.parse(data);
  return validated.question;
}

/**
 * Retrieves past chat interactions alongside validation statuses from concurrent endpoints.
 */
export async function fetchFeynmanHistory(blockId: string): Promise<{
  chatHistory: FeynmanChatMessage[];
  isFeynmanPassed: boolean;
}> {
  // unknown response payloads enforce strict validation at the integration gate
  const [historyRes, statsRes] = await Promise.all([
    api.get<unknown>(`/api/feynman/block/${blockId}/history`),
    api.get<unknown>(`/api/feynman/block/${blockId}/stats`),
  ]);

  const validatedHistory = FeynmanHistoryResponseSchema.parse(historyRes.data);
  const validatedStats = FeynmanStatsResponseSchema.parse(statsRes.data);

  return {
    chatHistory: validatedHistory.chatHistory ?? [],
    isFeynmanPassed: validatedStats.isFeynmanPassed,
  };
}

/**
 * Dispatches the student's vocalized answer response to the processing pipeline.
 */
export async function sendFeynmanMessage(
  blockId: string,
  message: string
): Promise<FeynmanChatResponse> {
  const { data } = await api.post<unknown>(
    `/api/feynman/block/${blockId}/chat`,
    { message }
  );
  return FeynmanChatResponseSchema.parse(data);
}
