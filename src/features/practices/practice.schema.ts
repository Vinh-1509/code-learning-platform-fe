import { z } from 'zod';

export const ExerciseDifficultySchema = z.enum(['easy', 'medium', 'hard']);
export const ExerciseTypeSchema = z.enum(['drag_drop', 'fill_blank']);

export const ExerciseSchema = z.object({
  _id: z.string(),
  title: z.string(),
  instruction: z.string(),
  language: z.string(),
  tagId: z.array(z.string()),
  type: ExerciseTypeSchema,
  level: ExerciseDifficultySchema,
  order: z.number(),
  status: z.enum(['completed', 'active', 'locked']).optional(),
});

export const ExercisePageResponseSchema = z.object({
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  data: z.array(ExerciseSchema),
});

export const WeaknessTagResponseSchema = z.object({
  _id: z.string(),
  name: z.string(),
  description: z.string(),
  totalAttempts: z.number(),
  failAttempts: z.number(),
  failureRate: z.number(),
  isWeak: z.boolean(),
  updatedAt: z.string(),
});

export type ExercisePageResponse = z.infer<typeof ExercisePageResponseSchema>;
export type WeaknessTagResponse = z.infer<typeof WeaknessTagResponseSchema>;
export type ExerciseType = z.infer<typeof ExerciseTypeSchema>;
export type Difficulty = z.infer<typeof ExerciseDifficultySchema>;
export type Exercise = z.infer<typeof ExerciseSchema>;
