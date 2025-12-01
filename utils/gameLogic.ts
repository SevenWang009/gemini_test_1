import { Account, BAN_DURATION_MS, MatchRecord } from '../types';

/**
 * Recalculates the ban status of an account based on its match history.
 * A player is banned if their most recent LOSS was within the last 3 days.
 */
export const calculateAccountStatus = (history: MatchRecord[]): { isBanned: boolean; banExpiresAt: number | null } => {
  if (!history || history.length === 0) {
    return { isBanned: false, banExpiresAt: null };
  }

  // Sort history by timestamp descending (newest first) to find the latest relevant games
  const sortedHistory = [...history].sort((a, b) => b.timestamp - a.timestamp);

  // Find the most recent loss
  const latestLoss = sortedHistory.find(m => m.result === 'LOSS');

  if (!latestLoss) {
    return { isBanned: false, banExpiresAt: null };
  }

  const now = Date.now();
  const banExpiration = latestLoss.timestamp + BAN_DURATION_MS;

  if (banExpiration > now) {
    return { isBanned: true, banExpiresAt: banExpiration };
  }

  return { isBanned: false, banExpiresAt: null };
};

export interface SanctionAnalysis {
  score: number; // 0-100
  level: 'SAFE' | 'WARNING' | 'DANGER';
  reasons: string[];
  description: string;
}

/**
 * Analyzes match history to determine if the account is likely being "sanctioned" (ELO hell/targeted by system).
 * STRICTER VERSION
 */
export const calculateSanctionIndex = (history: MatchRecord[]): SanctionAnalysis => {
  if (!history || history.length < 3) {
    return {
      score: 0,
      level: 'SAFE',
      reasons: [],
      description: '数据样本不足，暂无法分析系统机制。'
    };
  }

  let score = 0;
  const reasons: string[] = [];
  const sorted = [...history].sort((a, b) => b.timestamp - a.timestamp);
  const recent10 = sorted.slice(0, 10);
  
  // 1. 连败权重 (Streak) - 加大权重
  let currentLossStreak = 0;
  for (const match of sorted) {
    if (match.result === 'LOSS') currentLossStreak++;
    else break;
  }
  
  if (currentLossStreak >= 2) {
    score += currentLossStreak * 15; // 2连败+30, 3连败+45, 4连败+60
    reasons.push(`当前遭遇 ${currentLossStreak} 连败`);
  }

  // 2. 近期胜率 (Recent Win Rate) - 极低胜率直接拉满
  const recentWins = recent10.filter(m => m.result === 'WIN').length;
  const recentWinRate = (recentWins / recent10.length) * 100;
  
  if (recentWinRate <= 20) {
    score += 50; // 极高风险
    reasons.push('近10场胜率极低 (≤20%)');
  } else if (recentWinRate <= 40) {
    score += 30; // 高风险
    reasons.push('近期胜率低迷 (≤40%)');
  }

  // 3. 短时间高频失利 (Density)
  // 检查最近5场里输了多少场
  const recent5 = sorted.slice(0, 5);
  const lossesIn5 = recent5.filter(m => m.result === 'LOSS').length;
  if (lossesIn5 >= 4) {
    score += 35;
    reasons.push('最近5场输掉4场及以上');
  }

  // 4. "必输局"特征 (隔一把输一把，或者连胜后连败)
  // 简单检测：如果最近10场里，由连胜转为连败
  // 略过，保持逻辑简单有效

  // Cap score at 100
  score = Math.min(100, score);

  let level: 'SAFE' | 'WARNING' | 'DANGER' = 'SAFE';
  let description = '账号环境健康，处于正常匹配池。';

  if (score >= 75) {
    level = 'DANGER';
    description = '极高风险！系统判定该账号正处于“制裁组”。此时排位极大概率匹配到离谱队友。强烈建议立刻停止排位，至少休息24小时或去打娱乐模式洗数据。';
  } else if (score >= 45) {
    level = 'WARNING';
    description = '风险较高。账号近期表现已触发ELO机制平衡，继续排位容易遇到“尽力局”。建议见好就收。';
  } else if (score > 20) {
     description = '存在轻微风险，建议保持平稳心态。';
  }

  return { score, level, reasons, description };
};