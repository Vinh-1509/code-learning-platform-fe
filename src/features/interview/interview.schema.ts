import { z } from 'zod';

export const FeynmanChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

export const FeynmanQuestionResponseSchema = z.object({
  blockId: z.string(),
  question: z.string(),
});

export const FeynmanHistoryResponseSchema = z.object({
  blockId: z.string(),
  chatHistory: z.array(FeynmanChatMessageSchema),
});

export const FeynmanChatResponseSchema = z.object({
  blockId: z.string(),
  reply: z.string(),
  isPassed: z.boolean(),
});

export const FeynmanStatsResponseSchema = z.object({
  blockId: z.string(),
  isFeynmanPassed: z.boolean(),
});

// Export các Type để file API sử dụng nếu cần
export type FeynmanChatMessage = z.infer<typeof FeynmanChatMessageSchema>;
export type FeynmanChatResponse = z.infer<typeof FeynmanChatResponseSchema>;
