import { z } from 'zod';

export const LeaderboardUserSchema = z.object({
  _id: z.string(),
  name: z.string().optional(),
  username: z.string().optional(),
  coins: z.number(),
  rank: z.number().optional(),
});
export const CurrentUserRankSchema = z.object({
  rank: z.number(),
  username: z.string().optional(),
  coins: z.number(),
});
export const LeaderboardResponseSchema = z.object({
  me: CurrentUserRankSchema.nullable().optional(),
  totalUsers: z.number(),
  totalCoins: z.number(),
  topUsers: z.array(LeaderboardUserSchema),
});
