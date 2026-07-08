export interface TargetUser {
  _id: string;
  name?: string;
  username?: string;
  coins: number;
  selectedLanguage?: string[];
  rank?: number;
}
export interface ClassTargetsResponse {
  language: string;
  count: number;
  users: TargetUser[];
}
// Response của API GET /api/users/leaderboard
export interface LeaderboardResponse {
  topUsers: TargetUser[];
}

// Response của API Submit bài tập (Gacha)
export interface GachaResponse {
  correct: boolean;
  attemptNumber: number;
  prizeType: 'coin' | 'attack' | 'no prize';
  amount: number;
  currentCoin: number;
  hasAttackSlot: boolean;
  nextRewardAvailableAt: string;
}
export interface AttackResponse {
  status: 'success' | 'error';
  msg: string;
  newCoins: number;
  details: {
    coinsStolen: number;
    targetName: string;
    targetCoinsRemaining: number;
    attackerCoinsBefore: number;
    attackerCoinsAfter: number;
  };
}
export interface AttackNotificationItem {
  id: string;
  type: 'attack';
  attackerName: string;
  coinsLost: number;
  message: string;
  createdAt: string;
}
// Response của API GET /api/users/notifications
export interface PollingNotificationResponse {
  hasNotification: boolean;
  notifications: AttackNotificationItem[];
}
