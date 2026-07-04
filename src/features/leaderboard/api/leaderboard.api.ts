import type { TargetUser } from '@/types/api/gacha.types';

const IS_MOCK = true;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let mockLeaderboard: TargetUser[] = [
  { _id: 'user_1', name: 'Tran Gia Bao', coins: 2450, rank: 1 },
  { _id: 'user_2', name: 'Le Minh Khoi', coins: 1820, rank: 2 },
  { _id: 'user_3', name: 'Nguyen Hoang Nam', coins: 1500, rank: 3 },
  { _id: 'my_user_id', name: 'You', coins: 1250, rank: 4 },
  { _id: 'user_4', name: 'Pham Thuy Vy', coins: 980, rank: 5 },
  { _id: 'user_5', name: 'Doan Bao Ngoc', coins: 860, rank: 6 },
  { _id: 'user_6', name: 'Hoang Duc Minh', coins: 740, rank: 7 },
  { _id: 'user_7', name: 'Vu Minh Chau', coins: 690, rank: 8 },
];

export async function fetchLeaderboard(): Promise<TargetUser[]> {
  if (IS_MOCK) {
    await sleep(500);
    return mockLeaderboard;
  }

  const res = await fetch('/api/leaderboard');
  if (!res.ok) throw new Error('Failed to fetch leaderboard');

  // 💡 SỬA TẠI ĐÂY: Ép kiểu dữ liệu JSON trả về thành mảng TargetUser[]
  return (await res.json()) as TargetUser[];
}

export function mockDecreaseMyCoins(amount: number) {
  if (!IS_MOCK) return;
  mockLeaderboard = mockLeaderboard.map((user) => {
    if (user._id === 'my_user_id') {
      return { ...user, coins: Math.max(0, user.coins - amount) };
    }
    return user;
  });
}
