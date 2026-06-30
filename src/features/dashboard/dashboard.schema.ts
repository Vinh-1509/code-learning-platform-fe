import { z } from 'zod';

export const DashboardUserSchema = z.object({
  _id: z.string(),
  email: z.string().email(),
  username: z.string(),
  fullName: z.string(),
  selectedLanguage: z.array(z.string()),
});

export const DashboardRoadmapSchema = z.object({
  _id: z.string(),
  title: z.string(),
  language: z.string(),
});

export const DashboardStatsSchema = z.object({
  totalLessons: z.number(),
  totalLearnedLessons: z.number(),
  totalExercises: z.number(),
  totalCompletedExercises: z.number(),
  overallProgress: z.number(),
  weakTagsCount: z.number(),
});

export const DashboardMilestoneSchema = z.object({
  _id: z.string(),
  title: z.string(),
  status: z.enum(['active', 'locked', 'completed']),
  completionPercentage: z.number(),
});

/**
 * Runtime validation schema for the true Dashboard API response.
 * Mapped 100% directly from the verified domain interfaces.
 */
export const DashboardResponseSchema = z.object({
  user: DashboardUserSchema,
  roadmap: DashboardRoadmapSchema,
  stats: DashboardStatsSchema,
  milestones: z.array(DashboardMilestoneSchema),
  dailyReview: z.object({
    pendingCount: z.number(),
  }),
});

// Suy diễn ra type chuẩn để export sang file API
export type DashboardResponse = z.infer<typeof DashboardResponseSchema>;
