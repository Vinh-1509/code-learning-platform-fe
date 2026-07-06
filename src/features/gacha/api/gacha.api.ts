import { api } from '@/lib/axios';
import { z } from 'zod';
import { mockDecreaseMyCoins } from '@/features/leaderboard/api/leaderboard.api';

// Import các Schema vừa định nghĩa
import {
  GachaResponseSchema,
  ClassTargetsResponseSchema,
  AttackResponseSchema,
  PollingNotificationResponseSchema,
  TargetUserSchema,
} from '../gacha.schema';

// Suy luận ngược kiểu dữ liệu ra để export ra ngoài cho các hook/component xài
export type GachaResponse = z.infer<typeof GachaResponseSchema>;
export type TargetUser = z.infer<typeof TargetUserSchema>;
export type AttackResponse = z.infer<typeof AttackResponseSchema>;
export type PollingNotificationResponse = z.infer<
  typeof PollingNotificationResponseSchema
>;

const IS_MOCK = false;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// 1. API Hoàn thành bài tập & Gacha Phần thưởng
// export async function claimGachaReward(exerciseId: string): Promise<GachaResponse> {
//   if (IS_MOCK) {
//     await sleep(800);
//     const isCoin = Math.random() < 0.7;
//     const randomCoinAmount = Math.floor(Math.random() * 31) + 20;
//     return {
//       correct: true,
//       attemptNumber: 1,
//       prizeType: isCoin ? 'coin' : 'attack',
//       amount: isCoin ? randomCoinAmount : 0,
//       currentCoin: 1250 + (isCoin ? randomCoinAmount : 0),
//       hasAttackSlot: !isCoin,
//       nextRewardAvailableAt: new Date().toISOString(),
//     };
//   }

//   // 💡 CHUYỂN SANG AXIOS + ZOD STRICT PARSING
//   const { data } = await api.post<unknown>(`/api/practice/exercises/${exerciseId}/submit`);
//   return GachaResponseSchema.parse(data);
// }

// 2. API Lấy danh sách mục tiêu cùng ngôn ngữ học
export async function fetchClassTargets(): Promise<TargetUser[]> {
  // if (IS_MOCK) {
  //   await sleep(400);
  //   return [
  //     { _id: '6a157a618e93bffbaf3311c8', name: 'Quan', coins: 250, selectedLanguage: 'C++' },
  //     { _id: '6a088f9f27e56d7d422966e7', name: 'Vinh', coins: 120, selectedLanguage: 'C++' },
  //     { _id: 'user_1', name: 'Tran Gia Bao', coins: 2450, selectedLanguage: 'C++' },
  //     { _id: 'user_2', name: 'Le Minh Khoi', coins: 1820, selectedLanguage: 'C++' },
  //     { _id: 'user_4', name: 'Pham Thuy Vy', coins: 980, selectedLanguage: 'C++' },
  //   ];
  // }

  // 💡 CHUYỂN SANG AXIOS + ZOD: Parse bọc object { users: [...] } rồi trả về mảng phẳng
  const { data } = await api.get<unknown>('/api/action/targets');
  const parsedData = ClassTargetsResponseSchema.parse(data);
  return parsedData.users.map((user, index) => ({
    ...user,
    name: user.username || `User_${user._id.slice(-4)}`, // Nếu ko có tên thì lấy 4 ký tự cuối của ID làm tên tạm
    rank: index + 1,
  }));
}

// 3. API Thực thi Thả Bug cướp điểm
export async function submitAttack(targetId: string): Promise<AttackResponse> {
  if (IS_MOCK) {
    await sleep(1000);
    return {
      status: 'success',
      msg: 'Successfully bugged!',
      newCoins: 1350,
    };
  }

  // 💡 CHUYỂN SANG AXIOS + ZOD
  const { data } = await api.post<unknown>('/api/action/attack', { targetId });
  return AttackResponseSchema.parse(data);
}

// 4. API Ngầm Kiểm tra Biến động số dư (Short Polling)
export async function checkGachaNotifications(): Promise<PollingNotificationResponse> {
  if (IS_MOCK) {
    const luckyRoll = Math.random() < 0.2;
    const mockHackers = ['Minh Khoi', 'Gia Bao', 'Thuy Vy'];
    const randomHacker =
      mockHackers[Math.floor(Math.random() * mockHackers.length)];

    if (luckyRoll) {
      mockDecreaseMyCoins(100);
      return {
        hasNotification: true,
        notifications: [
          {
            id: String(Math.random()),
            type: 'attack',
            attackerName: randomHacker,
            coinsLost: 100,
            message: `Bạn đã bị ${randomHacker} thả bug mất 100 Coin!`,
            createdAt: new Date().toISOString(),
          },
        ],
      };
    }

    return {
      hasNotification: false,
      notifications: [],
    };
  }

  // 💡 CHUYỂN SANG AXIOS + ZOD
  const { data } = await api.get<unknown>('/api/users/notifications');
  return PollingNotificationResponseSchema.parse(data);
}
