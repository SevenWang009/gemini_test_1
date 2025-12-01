
export enum Rank {
  BRONZE = '青铜',
  SILVER = '白银',
  GOLD = '黄金',
  PLATINUM = '铂金',
  DIAMOND = '钻石',
  MASTER = '星耀',
  GRANDMASTER = '最强王者',
  KING = '荣耀王者',
}

export type Platform = 'WECHAT' | 'QQ';

export interface MatchRecord {
  id: string;
  result: 'WIN' | 'LOSS';
  timestamp: number;
  hero?: string; // Optional hero name for better tracking
}

export interface Account {
  id: string;
  name: string;
  rank: Rank;
  platform: Platform; // New field
  isBanned: boolean;
  banExpiresAt: number | null;
  history: MatchRecord[];
}

export const BAN_DURATION_MS = 3 * 24 * 60 * 60 * 1000; // 3 Days
