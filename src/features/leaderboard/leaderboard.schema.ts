import { z } from 'zod';

// Định nghĩa lại cấu trúc nếu không muốn import chéo folder gacha
export const LeaderboardUserSchema = z.object({
  _id: z.string(),
  name: z.string().optional(),
  username: z.string().optional(),
  coins: z.number(),
  rank: z.number().optional(),
});

// Cấu trúc bọc chuẩn đét của BE trả về: { topUsers: [...] }
export const LeaderboardResponseSchema = z.object({
  totalUsers: z.number(),
  totalCoins: z.number(),
  topUsers: z.array(LeaderboardUserSchema),
});
