import type {
  GachaResponse,
  PollingNotificationResponse,
  TargetUser,
  AttackResponse,
} from '@/types/api/gacha.types';
import { fetchLeaderboard } from '@/features/leaderboard/api/leaderboard.api';
import { mockDecreaseMyCoins } from '@/features/leaderboard/api/leaderboard.api';

const IS_MOCK = true;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function claimGachaReward(): Promise<GachaResponse> {
  if (IS_MOCK) {
    await sleep(800);
    const isCoin = Math.random() < 0.1;
    const randomCoinAmount = Math.floor(Math.random() * 31) + 20;
    return {
      status: 'success',
      prizeType: isCoin ? 'coin' : 'attack',
      amount: isCoin ? randomCoinAmount : 0,
      currentCoins: 1250 + (isCoin ? randomCoinAmount : 0),
      hasAttackSlot: !isCoin,
    };
  }

  const res = await fetch('/api/lessons/complete', { method: 'POST' });
  if (!res.ok) throw new Error('Gacha claim failed');

  return (await res.json()) as GachaResponse;
}

export async function fetchClassTargets(): Promise<TargetUser[]> {
  return fetchLeaderboard();
}

export async function fetchLeaderboardTargets(): Promise<TargetUser[]> {
  return fetchLeaderboard();
}

export async function submitAttack(targetId: string): Promise<AttackResponse> {
  if (IS_MOCK) {
    await sleep(1000);
    return {
      status: 'success',
      msg: 'Attack successful',
      newCoins: 1350,
    };
  }

  const res = await fetch('/api/action/attack', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetId }),
  });
  if (!res.ok) throw new Error('Attack submission failed');

  return (await res.json()) as AttackResponse;
}

export async function checkGachaNotifications(): Promise<PollingNotificationResponse> {
  if (IS_MOCK) {
    const luckyRoll = Math.random() < 0.3;
    const mockHackers = ['Minh Khoi', 'Gia Bao', 'Thuy Vy'];
    const randomHacker =
      mockHackers[Math.floor(Math.random() * mockHackers.length)];

    if (luckyRoll) {
      mockDecreaseMyCoins(100);

      return {
        hasNotification: true,
        message: `Your submission was bugged by [${randomHacker}] and 300 Coins were stolen!`,
      };
    }

    return {
      hasNotification: false,
      message: '',
    };
  }

  const res = await fetch('/api/users/notifications');
  if (!res.ok) throw new Error('Notification polling failed');

  // 💡 FIX LỖI 3: Ép kiểu dữ liệu trả về thành PollingNotificationResponse
  return (await res.json()) as PollingNotificationResponse;
}
