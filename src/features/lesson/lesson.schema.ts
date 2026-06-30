import { z } from 'zod';

export const ContentItemSchema = z.object({
  type: z.enum(['theory', 'code', 'practice']),
  data: z.object({
    order: z.number(),
    text: z.string().optional(),
    code: z.string().optional(),
    explanation: z.string().optional(),
    exerciseId: z.string().optional(),
    required: z.boolean().optional(),
  }),
});

export const BlockSchema = z.object({
  _id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  content: z.array(ContentItemSchema),
  feynmanQuestion: z.string(),
  status: z.enum(['active', 'locked', 'completed']),
  isFeynmanPassed: z.boolean(),
});

export const LessonDetailResponseSchema = z.object({
  _id: z.string(),
  title: z.string(),
  order: z.number(),
  blocks: z.array(BlockSchema),
  progress: z.object({
    completionPercentage: z.number(),
    isCompleted: z.boolean(),
    lastAccessed: z.string().optional(),
  }),
});

export type LessonDetailResponse = z.infer<typeof LessonDetailResponseSchema>;

export const DragDropBlockResponseSchema = z.object({
  id: z.string(),
  code: z.string(),
  indent: z.number(),
});

export const DragDropExerciseResponseSchema = z.object({
  _id: z.string(),
  type: z.literal('drag_drop'),
  title: z.string(),
  instruction: z.string(),
  language: z.string(),
  level: z.string(),
  order: z.number(),
  data: z.object({
    expectedSlots: z.number().optional(),
    blocks: z.array(DragDropBlockResponseSchema),
    answer: z.array(z.string().nullable()).optional(),
  }),
  hints: z.record(z.string(), z.string()).optional(),
});

export const FillBlankExerciseResponseSchema = z.object({
  _id: z.string(),
  type: z.literal('fill_blank'),
  title: z.string(),
  instruction: z.string(),
  language: z.string(),
  level: z.string(),
  order: z.number(),
  data: z.object({
    template: z.array(z.string()),
    placeholders: z.record(z.string(), z.string()),
  }),
  hints: z.record(z.string(), z.string()).optional(),
});

// Discriminated union handling different core practice styles
export const ExerciseResponseSchema = z.discriminatedUnion('type', [
  DragDropExerciseResponseSchema,
  FillBlankExerciseResponseSchema,
]);

export const SubmitAnswerItemSchema = z.object({
  field: z.string(),
  isCorrect: z.boolean(),
});

export const SubmitAnswerResponseSchema = z.object({
  correct: z.boolean(),
  items: z.array(SubmitAnswerItemSchema).optional(),
  attemptNumber: z.number().optional(),
});

export const HintResponseSchema = z.object({
  hintLevel: z.number(),
  hint: z.string(),
});

export const ExerciseAttemptResponseSchema = z.object({
  _id: z.string(),
  exerciseId: z.string(),
  isPassed: z.boolean(),
  items: z.array(SubmitAnswerItemSchema),
  hintLevel: z.number(),
  userAnswer: z.unknown().optional(),
  attemptNumber: z.number(),
  attemptedAt: z.string(),
});

export const ExplainAnswerItemSchema = z.object({
  field: z.string(),
  isCorrect: z.boolean(),
  explanation: z.string(),
});

export const ExplainAnswerResponseSchema = z.object({
  exerciseId: z.string(),
  isCorrect: z.boolean(),
  feedback: z.string(),
  items: z.array(ExplainAnswerItemSchema),
  suggestion: z.string().optional(),
});

export type ExerciseResponse = z.infer<typeof ExerciseResponseSchema>;
export type SubmitAnswerResponse = z.infer<typeof SubmitAnswerResponseSchema>;
export type HintResponse = z.infer<typeof HintResponseSchema>;
export type ExerciseAttemptResponse = z.infer<
  typeof ExerciseAttemptResponseSchema
>;
export type ExplainAnswerResponse = z.infer<typeof ExplainAnswerResponseSchema>;
