import { z } from 'zod';

/**
 * Validates the allowed language strings supported by the compiler environment.
 */
export const LanguageSchema = z.enum(['C++', 'Java']);

/**
 * Runtime validation schema for the raw API object structure received from backend.
 */
export const LanguageDetailResponseSchema = z.object({
  _id: z.string(),
  language: LanguageSchema,
  info: z.string(),
  strengths: z.array(z.string()),
  challenges: z.array(z.string()),
  useCases: z.array(z.string()),
});

// Expose inferred type for API layers
export type LanguageDetailResponse = z.infer<
  typeof LanguageDetailResponseSchema
>;
