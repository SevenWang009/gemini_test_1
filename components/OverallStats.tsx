import React from 'react';
import { Account, Rank } from '../types';
import { Activity, ShieldAlert, Trophy, Users, BarChart } from 'lucide-react';

interface OverallStatsProps {
  accounts: Account[];
}

export const OverallStats: React.FC<OverallStatsProps> = ({ accounts }) => {
  if (accounts.length === 0) return null;

  const totalAccounts = accounts.length;
  const bannedAccounts = accounts.filter(a => a.isBanned).length;
  
  const allHistory = accounts.flatMap(a => a.history);
  const totalGames = allHistory.length;
  const totalWins = allHistory.filter(h => h.result === 'WIN').length;
  const totalWinRate = totalGames > 0 ? ((totalWins / totalGames) * 100).toFixed(1) : '0.0';

  // Find most played platform
  const qqCount = accounts.filter(a => a.platform === 'QQ').length;
  const wxCount = accounts.filter(a => a.platform === 'WECHAT').length;
  const mainPlatform = wxCount >= qqCount ? '微信区' : 'QQ区';

  // --- Chart Data Preparation ---
  
  // 1. Rank Distribution
  const rankCounts = accounts.reduce<Record<string, number>>((acc, curr) => {
    acc[curr.rank] = (acc[curr.rank] || 0) + 1;
    return acc;
  }, {});
  
  const rankOrder = Object.values(Rank); // Use Enum order
  // Object.values on a Record<string, number> should return number[], but explicit casting handles potential inference issues.
  const countValues = Object.values(rankCounts) as number[];
  const maxRankCount = Math.max(...countValues, 1); // Avoid div by zero

  // 2. Platform Win Rates
  const getPlatformWinRate = (p: 'QQ' | 'WECHAT') => {
    const pAccounts = accounts.filter(a => a.platform === p);
    const pHistory = pAccounts.flatMap(a => a.history);
    if (pHistory.length === 0) return 0;
    const wins = pHistory.filter(h => h.result === 'WIN').length;
    return (wins / pHistory.length) * 100;
  };
  
  const qqWinRate = getPlatformWinRate('QQ');
  const wxWinRate = getPlatformWinRate('WECHAT');

  return (
    <div className="space-y-6 mb-8">
      {/* Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col justify-between">
          <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-400 text-xs uppercase font-medium">综合胜率</p>
                <h3 className="text-2xl font-bold text-white mt-1">{totalWinRate}%</h3>
              </div>
              <div className={`p-2 rounded-lg ${Number(totalWinRate) >= 50 ? 'bg-emerald-900/30 text-emerald-400' : 'bg-red-900/30 text-red-400'}`}>
                <Activity size={20} />
              </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">共 {totalGames} 场比赛</p>
        </div>

        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col justify-between">
          <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-400 text-xs uppercase font-medium">封禁中</p>
                <h3 className="text-2xl font-bold text-white mt-1">{bannedAccounts} <span className="text-sm font-normal text-slate-500">/ {totalAccounts}</span></h3>
              </div>
              <div className="p-2 rounded-lg bg-orange-900/30 text-orange-400">
                <ShieldAlert size={20} />
              </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">{bannedAccounts > 0 ? '正在自律冷却中' : '全员可出战'}</p>
        </div>

        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col justify-between">
          <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-400 text-xs uppercase font-medium">主玩大区</p>
                <h3 className="text-lg font-bold text-white mt-1 truncate">{mainPlatform}</h3>
              </div>
              <div className="p-2 rounded-lg bg-indigo-900/30 text-indigo-400">
                <Users size={20} />
              </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">微信: {wxCount} | QQ: {qqCount}</p>
        </div>

        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col justify-between">
          <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-400 text-xs uppercase font-medium">数据备份</p>
                <div className="text-xs text-slate-300 mt-2">本地数据已同步</div>
              </div>
              <div className="p-2 rounded-lg bg-blue-900/30 text-blue-400">
                <Trophy size={20} />
              </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">支持导入/导出</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Rank Distribution */}
        <div className="md:col-span-2 bg-slate-800 p-5 rounded-xl border border-slate-700 flex flex-col">
           <h4 className="text-sm font-medium text-slate-400 mb-4 flex items-center gap-2">
             <BarChart size={16} /> 账号段位分布
           </h4>
           <div className="flex-1 min-h-[140px] flex items-end justify-between gap-1 pt-6 px-2">
             {rankOrder.map((rank) => {
               const count = rankCounts[rank] || 0;
               // Calculate height, ensure minimum visibility (5%) if count > 0, else 2px for baseline
               const heightPercent = count > 0 ? Math.max((count / maxRankCount) * 100, 5) : 0;
               
               return (
                 <div key={rank} className="flex flex-col items-center flex-1 h-full justify-end group cursor-default">
                   <div className="w-full max-w-[40px] h-full flex items-end relative">
                     <div 
                        className={`w-full rounded-t-sm transition-all relative ${count > 0 ? 'bg-indigo-600/60 hover:bg-indigo-500' : 'bg-slate-700/30 h-[2px]'}`}
                        style={{ height: count > 0 ? `${heightPercent}%` : '2px' }}
                     >
                       {count > 0 && (
                         <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 px-1.5 rounded border border-slate-700">
                           {count}
                         </span>
                       )}
                     </div>
                   </div>
                   <span className="text-[10px] text-slate-500 mt-2 truncate w-full text-center scale-90" title={rank}>{rank}</span>
                 </div>
               )
             })}
           </div>
        </div>

        {/* Platform Win Rates */}
        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 flex flex-col justify-center">
           <h4 className="text-sm font-medium text-slate-400 mb-6">平台胜率对比</h4>
           
           <div className="space-y-6">
             {/* WeChat */}
             <div>
               <div className="flex justify-between text-xs mb-1">
                 <span className="text-emerald-400 flex items-center gap-1">微信区</span>
                 <span className="font-mono text-white">{wxWinRate.toFixed(1)}%</span>
               </div>
               <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                 <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${wxWinRate}%` }}></div>
               </div>
             </div>

             {/* QQ */}
             <div>
               <div className="flex justify-between text-xs mb-1">
                 <span className="text-blue-400 flex items-center gap-1">QQ区</span>
                 <span className="font-mono text-white">{qqWinRate.toFixed(1)}%</span>
               </div>
               <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                 <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${qqWinRate}%` }}></div>
               </div>
             </div>
           </div>
           
           <div className="mt-6 text-xs text-slate-500 text-center bg-slate-900/50 py-2 rounded">
              {Math.abs(wxWinRate - qqWinRate) < 1 
                ? '两区表现持平' 
                : wxWinRate > qqWinRate 
                  ? '微信区表现优于QQ区' 
                  : 'QQ区表现优于微信区'}
           </div>
        </div>

      </div>
    </div>
  );
};