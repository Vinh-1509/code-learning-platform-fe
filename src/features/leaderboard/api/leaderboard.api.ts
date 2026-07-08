import { api } from '@/lib/axios';
import { z } from 'zod';
import {
  LeaderboardResponseSchema,
  LeaderboardUserSchema,
} from '../leaderboard.schema';

// Suy luận Type tự động từ Zod Schema (Clear file .types.ts thủ công cũ)
export type TargetUser = z.infer<typeof LeaderboardUserSchema>;
export interface LeaderboardDataResponse {
  me?: {
    _id?: string;
    username?: string;
    name?: string;
    coins: number;
    rank: number;
  } | null;
  totalUsers: number;
  totalCoins: number;
  topUsers: TargetUser[];
}
const IS_MOCK = false; // 🔥 Bật false để húp data thật qua Axios

//const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Trạng thái lưu trữ bộ nhớ đệm cho dữ liệu Mock
let mockLeaderboard: TargetUser[] = [
  { _id: 'user_1', name: 'Tran Gia Bao', username: 'quan', coins: 2450 },
  { _id: 'user_2', name: 'Le Minh Khoi', username: 'vinh', coins: 1820 },
  {
    _id: 'user_3',
    name: 'Nguyen Hoang Nam',
    username: 'nam_nguyen',
    coins: 1500,
  },
  { _id: 'my_user_id', name: 'You', username: 'you_dev', coins: 1250 },
  { _id: 'user_4', name: 'Pham Thuy Vy', username: 'vy_thuy', coins: 980 },
  { _id: 'user_5', name: 'Doan Bao Ngoc', username: 'ngoc_bao', coins: 860 },
  { _id: 'user_6', name: 'Hoang Duc Minh', username: 'minh_duc', coins: 740 },
  { _id: 'user_7', name: 'Vu Minh Chau', username: 'chau_minh', coins: 690 },
];

export async function fetchLeaderboard(): Promise<LeaderboardDataResponse> {
  // if (IS_MOCK) {
  //   await sleep(500);
  //   const sortedMock = [...mockLeaderboard].sort((a, b) => b.coins - a.coins);
  //   return sortedMock.map((user, index) => ({
  //     ...user,
  //     rank: index + 1,
  //   }));
  // }

  // 💡 CHUYỂN SANG AXIOS + ZOD: Không bao giờ lo lệch Port hay lỗi 404
  const { data } = await api.get<unknown>('/api/users/leaderboard');

  // Ép qua bộ lọc Zod để kiểm tra cấu trúc runtime
  const parsedData = LeaderboardResponseSchema.parse(data);

  // Khớp nối adapter: Khôi phục trường name từ username của BE để bảo toàn giao diện
  const mappedUsers = parsedData.topUsers.map((user) => ({
    ...user,
    name: user.name || user.username || 'Anonymous',
  }));
  return {
    me: parsedData.me
      ? {
          ...parsedData.me,
          name: parsedData.me.username || 'You',
        }
      : null,
    totalUsers: parsedData.totalUsers,
    totalCoins: parsedData.totalCoins,
    topUsers: mappedUsers, // Ném mảng đã xử lý rank vào đây
  };
}

// Hàm hỗ trợ cày mock dữ liệu real-time
export function mockDecreaseMyCoins(amount: number) {
  if (!IS_MOCK) return;
  mockLeaderboard = mockLeaderboard.map((user) => {
    if (user._id === 'my_user_id') {
      return { ...user, coins: Math.max(0, user.coins - amount) };
    }
    return user;
  });
}
