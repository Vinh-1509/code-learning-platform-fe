import { z } from 'zod';

// 1. Schema cho Gacha Reward
export const GachaResponseSchema = z.object({
  correct: z.boolean(),
  attemptNumber: z.number(),
  prizeType: z.enum(['coin', 'attack']),
  amount: z.number(),
  currentCoin: z.number(), // Chuẩn key số ít của BE
  hasAttackSlot: z.boolean(),
  nextRewardAvailableAt: z.string(),
});

// 2. Schema cho Target User đấm lén
export const TargetUserSchema = z.object({
  _id: z.string(),
  name: z.string().optional(),
  username: z.string().optional(),
  coins: z.number(),
  selectedLanguage: z.array(z.string()).optional(),
  rank: z.number().optional(),
});

// Wrapper Object cho danh sách targets từ BE: { users: [...] }
export const ClassTargetsResponseSchema = z.object({
  users: z.array(TargetUserSchema),
});

// 3. Schema cho Attack Response
export const AttackResponseSchema = z.object({
  status: z.string(),
  msg: z.string(),
  newCoins: z.number(),
  details: z
    .object({
      coinsStolen: z.number(),
      targetName: z.string(),
      targetCoinsRemaining: z.number(),
      attackerCoinsBefore: z.number(),
      attackerCoinsAfter: z.number(),
    })
    .optional(),
});

// 4. Schema cho Polling Notification
export const NotificationItemSchema = z.object({
  id: z.string(),
  type: z.string(),
  attackerName: z.string(),
  coinsLost: z.number(),
  message: z.string(),
  createdAt: z.string(),
});

export const PollingNotificationResponseSchema = z.object({
  hasNotification: z.boolean(),
  notifications: z.array(NotificationItemSchema),
});
