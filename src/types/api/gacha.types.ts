export interface TargetUser {
  _id: string;
  name: string;
  coins: number;
  rank: number;
}

export interface GachaResponse {
  status: string;
  prizeType: 'coin' | 'attack';
  amount: number;
  currentCoins: number;
  hasAttackSlot: boolean;
}

export interface AttackResponse {
  status: string;
  msg: string;
  newCoins: number;
}

export interface PollingNotificationResponse {
  hasNotification: boolean;
  message: string;
}
