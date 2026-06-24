import { api } from '@/lib/axios';
import type {
  FeynmanQuestionResponse,
  FeynmanHistoryResponse,
  FeynmanStatsResponse,
  FeynmanChatResponse,
  FeynmanChatMessage,
} from '@/types/api/feynman.types';

export async function fetchFeynmanQuestion(blockId: string): Promise<string> {
  const { data } = await api.get<FeynmanQuestionResponse>(
    `/api/feynman/block/${blockId}/question`
  );
  return data.question;
}

export async function fetchFeynmanHistory(blockId: string): Promise<{
  chatHistory: FeynmanChatMessage[];
  isFeynmanPassed: boolean;
}> {
  const [historyRes, statsRes] = await Promise.all([
    api.get<FeynmanHistoryResponse>(`/api/feynman/block/${blockId}/history`),
    api.get<FeynmanStatsResponse>(`/api/feynman/block/${blockId}/stats`),
  ]);

  return {
    chatHistory: historyRes.data.chatHistory ?? [],
    isFeynmanPassed: statsRes.data.isFeynmanPassed,
  };
}

export async function sendFeynmanMessage(
  blockId: string,
  message: string
): Promise<FeynmanChatResponse> {
  const { data } = await api.post<FeynmanChatResponse>(
    `/api/feynman/block/${blockId}/chat`,
    { message }
  );
  return data;
}
