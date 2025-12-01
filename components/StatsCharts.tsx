import React from 'react';
import { MatchRecord } from '../types';

interface StatsChartsProps {
  history: MatchRecord[];
}

export const StatsCharts: React.FC<StatsChartsProps> = ({ history }) => {
  if (history.length === 0) {
    return <div className="text-center text-slate-500 py-10">暂无比赛记录。</div>;
  }

  const wins = history.filter(h => h.result === 'WIN').length;
  const losses = history.filter(h => h.result === 'LOSS').length;
  const total = wins + losses;
  const winRate = total > 0 ? (wins / total) * 100 : 0;

  // Prepare data for "Recent Trend" (Last 20 games)
  // We need them in chronological order for the line chart
  const recentGames = [...history]
    .sort((a, b) => a.timestamp - b.timestamp)
    .slice(-20); // Last 20

  // Calculate cumulative win rate over time for the trend line
  let cumulativeWins = 0;
  const trendPoints = recentGames.map((game, index) => {
    if (game.result === 'WIN') cumulativeWins++;
    const currentRate = (cumulativeWins / (index + 1)) * 100;
    return currentRate;
  });

  // SVG Dimensions
  const height = 150;
  const width = 300;
  const padding = 20;

  // Line Chart Path
  const getLinePath = () => {
    if (trendPoints.length < 2) return "";
    
    const xStep = (width - padding * 2) / (trendPoints.length - 1);
    // Y scale: 0% at height-padding, 100% at padding
    const getY = (rate: number) => height - padding - (rate / 100) * (height - padding * 2);

    return trendPoints.reduce((path, rate, index) => {
      const x = padding + index * xStep;
      const y = getY(rate);
      return index === 0 ? `M ${x} ${y}` : `${path} L ${x} ${y}`;
    }, "");
  };

  return (
    <div className="space-y-6">
      
      {/* Win/Loss Bar & Stats */}
      <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
        <h4 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">整体表现</h4>
        <div className="flex items-end gap-4 mb-2">
           <div className="flex-1">
             <div className="flex justify-between text-xs mb-1">
               <span className="text-emerald-400 font-bold">{wins} 胜</span>
               <span className="text-red-400 font-bold">{losses} 负</span>
             </div>
             <div className="h-4 bg-slate-800 rounded-full overflow-hidden flex">
               <div style={{ width: `${winRate}%` }} className="bg-emerald-500 h-full"></div>
               <div style={{ width: `${100 - winRate}%` }} className="bg-red-500 h-full"></div>
             </div>
           </div>
           <div className="text-right">
              <div className="text-2xl font-bold text-white">{winRate.toFixed(1)}%</div>
              <div className="text-xs text-slate-400">胜率</div>
           </div>
        </div>
      </div>

      {/* Recent Trend Chart */}
      <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
        <h4 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">近期胜率走势 (近20场)</h4>
        <div className="relative w-full overflow-hidden" style={{ height: `${height}px` }}>
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
             {/* Grid Lines */}
             <line x1={padding} y1={padding} x2={width-padding} y2={padding} stroke="#334155" strokeWidth="1" strokeDasharray="4" />
             <line x1={padding} y1={height/2} x2={width-padding} y2={height/2} stroke="#334155" strokeWidth="1" strokeDasharray="4" />
             <line x1={padding} y1={height-padding} x2={width-padding} y2={height-padding} stroke="#334155" strokeWidth="1" strokeDasharray="4" />
             
             {/* Trend Line */}
             <path d={getLinePath()} fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
             
             {/* Data Points */}
             {trendPoints.map((rate, index) => {
                const xStep = (width - padding * 2) / (trendPoints.length - 1);
                const x = padding + index * xStep;
                const y = height - padding - (rate / 100) * (height - padding * 2);
                return (
                  <circle key={index} cx={x} cy={y} r="3" className="fill-indigo-400 hover:fill-white transition-colors" />
                );
             })}
          </svg>
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-2 px-2">
           <span>最早</span>
           <span>最新</span>
        </div>
      </div>

      {/* Last 10 Matches Bar Code */}
      <div>
         <h4 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">近期战绩 (近10场)</h4>
         <div className="flex gap-1 h-8">
            {[...history].sort((a,b) => b.timestamp - a.timestamp).slice(0, 10).reverse().map((match) => (
               <div 
                 key={match.id} 
                 className={`flex-1 rounded-sm ${match.result === 'WIN' ? 'bg-emerald-500' : 'bg-red-500'}`}
                 title={`${match.result === 'WIN' ? '胜利' : '战败'} - ${new Date(match.timestamp).toLocaleDateString()}`}
               />
            ))}
            {Array.from({ length: Math.max(0, 10 - history.length) }).map((_, i) => (
              <div key={`empty-${i}`} className="flex-1 bg-slate-800 rounded-sm" />
            ))}
         </div>
      </div>
    </div>
  );
};