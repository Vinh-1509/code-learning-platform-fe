/**
 * Feynman AI interview domain API response types.
 */

export interface FeynmanChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface FeynmanQuestionResponse {
  blockId: string;
  question: string;
}

export interface FeynmanHistoryResponse {
  blockId: string;
  chatHistory: FeynmanChatMessage[];
}

export interface FeynmanChatResponse {
  blockId: string;
  reply: string;
  isPassed: boolean;
}

export interface FeynmanStatsResponse {
  blockId: string;
  isFeynmanPassed: boolean;
}
