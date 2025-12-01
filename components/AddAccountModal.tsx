
import React, { useState } from 'react';
import { X, MessageCircle } from 'lucide-react';
import { Rank, Platform } from '../types';

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, rank: Rank, platform: Platform) => void;
}

export const AddAccountModal: React.FC<AddAccountModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [rank, setRank] = useState<Rank>(Rank.PLATINUM);
  const [platform, setPlatform] = useState<Platform>('WECHAT');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd(name, rank, platform);
      setName('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">添加新账号</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">账号名称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="例如：国服最强李白"
              autoFocus
            />
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-300 mb-2">所属大区</label>
             <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPlatform('WECHAT')}
                  className={`flex items-center justify-center gap-2 py-2 rounded-lg border transition-all ${platform === 'WECHAT' ? 'bg-emerald-900/40 border-emerald-500 text-emerald-400' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                >
                   <MessageCircle size={18} className={platform === 'WECHAT' ? 'fill-emerald-500/20' : ''} />
                   微信区
                </button>
                <button
                  type="button"
                  onClick={() => setPlatform('QQ')}
                  className={`flex items-center justify-center gap-2 py-2 rounded-lg border transition-all ${platform === 'QQ' ? 'bg-blue-900/40 border-blue-500 text-blue-400' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                >
                   {/* Simple QQ icon representation using text or SVG would be ideal, using generic shape here */}
                   <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" stroke="none" /><text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fontSize="10" fontWeight="bold">QQ</text></svg>
                   QQ区
                </button>
             </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">当前段位</label>
            <select
              value={rank}
              onChange={(e) => setRank(e.target.value as Rank)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {Object.values(Rank).map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg shadow-lg shadow-indigo-900/20 transition-all"
            >
              确认添加
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
