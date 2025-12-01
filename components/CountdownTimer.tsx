import React, { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';

interface CountdownTimerProps {
  expiresAt: number;
  onExpire: () => void;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ expiresAt, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState<number>(expiresAt - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = expiresAt - Date.now();
      if (remaining <= 0) {
        clearInterval(interval);
        onExpire();
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-red-900/50 rounded-lg border border-red-500/30 text-red-200">
      <Lock className="w-8 h-8 mb-2 text-red-400" />
      <div className="text-xs uppercase tracking-widest mb-1 opacity-80">账号封禁中</div>
      <div className="text-xl font-mono font-bold">
        {days}天 {hours}时 {minutes}分 {seconds}秒
      </div>
      <p className="text-xs mt-2 text-center opacity-70">
        败局惩罚生效。请休息几天再战。
      </p>
    </div>
  );
};