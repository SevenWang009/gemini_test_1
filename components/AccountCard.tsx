import React, { useState } from 'react';
import { Trash2, Trophy, Skull, Sword, Sparkles, MessageSquare, BarChart2, GripVertical, CheckCircle, AlertTriangle, Flame, AlertOctagon } from 'lucide-react';
import { Account, Rank, BAN_DURATION_MS } from '../types';
import { CountdownTimer } from './CountdownTimer';
import { getCoachingAdvice } from '../services/geminiService';
import { calculateSanctionIndex } from '../utils/gameLogic';

interface AccountCardProps {
  account: Account;
  onDelete: (id: string) => void;
  onResult: (id: string, result: 'WIN' | 'LOSS') => void;
  onUnban: (id: string) => void;
  onOpenDetails: (account: Account) => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent, id: string) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, id: string) => void;
  showProgressBar: boolean;
}

export const AccountCard: React.FC<AccountCardProps> = ({ 
  account, 
  onDelete, 
  onResult, 
  onUnban, 
  onOpenDetails,
  draggable,
  onDragStart,
  onDragOver,
  onDrop,
  showProgressBar
}) => {
  const [advice, setAdvice] = useState<string | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  const wins = account.history.filter(h => h.result === 'WIN').length;
  const losses = account.history.filter(h => h.result === 'LOSS').length;
  const total = wins + losses;
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;

  // Sanction Analysis
  const sanction = calculateSanctionIndex(account.history);

  const handleGetAdvice = async () => {
    setLoadingAdvice(true);
    setAdvice(null);
    const tip = await getCoachingAdvice(account.rank, account.isBanned);
    setAdvice(tip);
    setLoadingAdvice(false);
  };

  const getRankColor = (rank: Rank) => {
    switch (rank) {
      case Rank.KING: return 'text-yellow-400';
      case Rank.GRANDMASTER: return 'text-orange-400';
      case Rank.MASTER: return 'text-red-400';
      case Rank.DIAMOND: return 'text-cyan-400';
      case Rank.PLATINUM: return 'text-blue-300';
      case Rank.GOLD: return 'text-yellow-600';
      default: return 'text-slate-400';
    }
  };

  // Calculate Progress for Ban
  let progressPercent = 0;
  if (account.isBanned && account.banExpiresAt) {
    const totalDuration = BAN_DURATION_MS;
    const timeLeft = Math.max(0, account.banExpiresAt - Date.now());
    progressPercent = Math.min(100, Math.max(0, ((totalDuration - timeLeft) / totalDuration) * 100));
  }

  // Styles based on status
  const cardBorderClass = account.isBanned 
    ? 'bg-slate-900/50 border-red-900/50' 
    : sanction.level === 'DANGER' 
      ? 'bg-slate-800 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
      : sanction.level === 'WARNING'
        ? 'bg-slate-800 border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.1)]'
        : 'bg-slate-800 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:shadow-[0_0_25px_rgba(16,185,129,0.2)] hover:border-emerald-400/50';

  return (
    <div 
      className={`relative group overflow-hidden rounded-xl border transition-all duration-300 flex flex-col ${cardBorderClass}`}
      draggable={draggable}
      onDragStart={(e) => onDragStart && onDragStart(e, account.id)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop && onDrop(e, account.id)}
    >
      
      {/* Background decoration */}
      <div className={`absolute top-0 right-0 p-4 opacity-5 pointer-events-none ${account.isBanned ? 'text-red-500' : 'text-emerald-500'}`}>
        <Sword size={120} />
      </div>

      {/* Dynamic Status Badge */}
      {!account.isBanned && (
        <>
          {sanction.level === 'SAFE' && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-emerald-600/90 text-white text-[10px] px-3 py-1 rounded-b-lg font-bold shadow-lg shadow-emerald-900/50 flex items-center gap-1 z-20 backdrop-blur-sm tracking-wide border-x border-b border-emerald-400/30">
              <CheckCircle size={10} /> 状态良好 | 可排位
            </div>
          )}
          {sanction.level === 'WARNING' && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-orange-600/90 text-white text-[10px] px-3 py-1 rounded-b-lg font-bold shadow-lg shadow-orange-900/50 flex items-center gap-1 z-20 backdrop-blur-sm tracking-wide border-x border-b border-orange-400/30">
              <AlertTriangle size={10} /> 风险上升 | 需谨慎
            </div>
          )}
          {sanction.level === 'DANGER' && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-red-600/90 text-white text-[10px] px-3 py-1 rounded-b-lg font-bold shadow-lg shadow-red-900/50 flex items-center gap-1 z-20 backdrop-blur-sm tracking-wide border-x border-b border-red-400/30 animate-pulse">
              <AlertOctagon size={10} /> 极高风险 | 建议停排
            </div>
          )}
        </>
      )}

      {/* Drag Handle */}
      {draggable && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-40 hover:!opacity-100 cursor-grab active:cursor-grabbing z-20">
          <GripVertical size={20} className="text-slate-400" />
        </div>
      )}

      {/* Platform Badge */}
      <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-xs font-bold z-10 ${
        account.platform === 'QQ' 
          ? 'bg-blue-900/60 text-blue-300 border-b border-l border-blue-500/30' 
          : 'bg-emerald-900/60 text-emerald-300 border-b border-l border-emerald-500/30'
      }`}>
        {account.platform === 'QQ' ? 'QQ区' : '微信区'}
      </div>

      <div className={`p-6 pb-2 relative z-10 flex-1 ${draggable ? 'pl-8' : ''} ${!account.isBanned ? 'bg-gradient-to-b from-emerald-900/5 to-transparent' : ''}`}>
        <div className="flex justify-between items-start mb-4 pr-12">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight truncate max-w-[180px]" title={account.name}>{account.name}</h3>
            <div className={`flex items-center gap-1.5 text-sm font-medium mt-1 ${getRankColor(account.rank)}`}>
              <Trophy size={14} />
              <span>{account.rank}</span>
            </div>
          </div>
          <button 
            onClick={() => onDelete(account.id)}
            className="text-slate-600 hover:text-red-400 transition-colors p-1"
            title="删除账号"
          >
            <Trash2 size={18} />
          </button>
        </div>

        {/* Banned State */}
        {account.isBanned && account.banExpiresAt ? (
          <div className="mb-6 animate-in fade-in zoom-in duration-300">
            <CountdownTimer expiresAt={account.banExpiresAt} onExpire={() => onUnban(account.id)} />
            
            {/* Optional Progress Bar */}
            {showProgressBar && (
               <div className="mt-3">
                 <div className="flex justify-between text-xs text-slate-500 mb-1">
                   <span>解封进度</span>
                   <span>{progressPercent.toFixed(1)}%</span>
                 </div>
                 <div className="h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-700/50">
                   <div 
                     className="h-full bg-gradient-to-r from-red-600 to-indigo-600 transition-all duration-1000"
                     style={{ width: `${progressPercent}%` }}
                   ></div>
                 </div>
               </div>
            )}
            
            <div className="mt-4">
               {advice ? (
                 <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700 text-sm text-indigo-200 italic">
                   " {advice} "
                 </div>
               ) : (
                 <button 
                   onClick={handleGetAdvice}
                   disabled={loadingAdvice}
                   className="w-full flex items-center justify-center gap-2 py-2 text-sm bg-indigo-900/30 text-indigo-300 border border-indigo-500/30 rounded-lg hover:bg-indigo-900/50 transition-colors"
                 >
                   {loadingAdvice ? <Sparkles className="animate-spin w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                   {loadingAdvice ? 'AI思考中...' : '请求AI教练复盘心态'}
                 </button>
               )}
            </div>
          </div>
        ) : (
          /* Active State Controls */
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => onResult(account.id, 'WIN')}
                className="group relative overflow-hidden flex items-center justify-center gap-2 py-3 bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold rounded-lg shadow-lg shadow-emerald-900/20 active:scale-95 transition-all"
              >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <Trophy className="w-5 h-5 group-hover:scale-110 transition-transform" />
                胜利
              </button>
              <button
                onClick={() => onResult(account.id, 'LOSS')}
                className="group relative overflow-hidden flex items-center justify-center gap-2 py-3 bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold rounded-lg shadow-lg shadow-red-900/20 active:scale-95 transition-all"
              >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <Skull className="w-5 h-5 group-hover:scale-110 transition-transform" />
                战败
              </button>
            </div>
            
            {/* Sanction Index Mini-Display */}
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-900/40 rounded-lg border border-slate-700/50" title={sanction.description}>
               <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                  <Flame size={12} className={sanction.level === 'SAFE' ? 'text-slate-500' : sanction.level === 'WARNING' ? 'text-orange-500' : 'text-red-500'} />
                  受制裁指数
               </div>
               <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${sanction.level === 'SAFE' ? 'bg-slate-500' : sanction.level === 'WARNING' ? 'bg-orange-500' : 'bg-red-600'}`} 
                    style={{ width: `${Math.max(5, sanction.score)}%` }}
                  ></div>
               </div>
               <span className={`text-xs font-bold ${sanction.level === 'SAFE' ? 'text-slate-500' : sanction.level === 'WARNING' ? 'text-orange-400' : 'text-red-500'}`}>
                 {sanction.score}
               </span>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-sm py-3 border-t border-slate-700/50">
          <div className="flex flex-col">
            <span className="text-slate-400 text-xs">胜率</span>
            <span className={`font-mono font-bold ${winRate >= 50 ? 'text-emerald-400' : 'text-red-400'}`}>
              {winRate}%
            </span>
          </div>
          <div className="flex gap-4">
             <div className="text-center">
                <div className="text-xs text-slate-500">胜</div>
                <div className="font-bold text-emerald-400">{wins}</div>
             </div>
             <div className="text-center">
                <div className="text-xs text-slate-500">负</div>
                <div className="font-bold text-red-400">{losses}</div>
             </div>
          </div>
        </div>
      </div>
      
      {/* Footer Actions */}
      <button 
        onClick={() => onOpenDetails(account)}
        className="w-full py-3 bg-slate-900/50 text-slate-400 text-sm font-medium hover:text-white hover:bg-slate-900 transition-colors border-t border-slate-700/50 flex items-center justify-center gap-2"
      >
        <BarChart2 size={16} /> 管理历史与分析
      </button>
    </div>
  );
};