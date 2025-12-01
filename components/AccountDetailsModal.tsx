import React, { useState } from 'react';
import { X, Trophy, Skull, Plus, Trash2, Edit2, Save, Calendar, BarChart2, History, AlertTriangle, CheckCircle, Info, Settings } from 'lucide-react';
import { Account, MatchRecord, Rank, Platform } from '../types';
import { StatsCharts } from './StatsCharts';
import { calculateSanctionIndex } from '../utils/gameLogic';

interface AccountDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: Account;
  onUpdateHistory: (accountId: string, newHistory: MatchRecord[]) => void;
  onUpdateAccount: (accountId: string, updates: Partial<Account>) => void;
}

export const AccountDetailsModal: React.FC<AccountDetailsModalProps> = ({ 
  isOpen, 
  onClose, 
  account, 
  onUpdateHistory,
  onUpdateAccount
}) => {
  const [activeTab, setActiveTab] = useState<'history' | 'charts'>('history');
  
  // Account Info Editing
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [infoForm, setInfoForm] = useState({
    name: account.name,
    rank: account.rank,
    platform: account.platform
  });
  
  // History Editing
  const [isEditing, setIsEditing] = useState<string | null>(null); // ID of record being edited, or 'NEW'
  const [editForm, setEditForm] = useState<{ result: 'WIN' | 'LOSS'; date: string; time: string; hero: string }>({
    result: 'WIN',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    hero: ''
  });

  if (!isOpen) return null;

  const sortedHistory = [...account.history].sort((a, b) => b.timestamp - a.timestamp);
  const sanction = calculateSanctionIndex(account.history);

  // --- Account Info Logic ---
  const handleSaveInfo = () => {
    onUpdateAccount(account.id, infoForm);
    setIsEditingInfo(false);
  };

  const toggleEditInfo = () => {
    if (isEditingInfo) {
      // Cancel
      setInfoForm({ name: account.name, rank: account.rank, platform: account.platform });
      setIsEditingInfo(false);
    } else {
      setInfoForm({ name: account.name, rank: account.rank, platform: account.platform });
      setIsEditingInfo(true);
    }
  };

  // --- History Logic ---
  const startEdit = (record?: MatchRecord) => {
    if (record) {
      const dateObj = new Date(record.timestamp);
      // Adjust for local timezone for input value
      const offset = dateObj.getTimezoneOffset() * 60000;
      const localDate = new Date(dateObj.getTime() - offset);
      
      setIsEditing(record.id);
      setEditForm({
        result: record.result,
        date: localDate.toISOString().split('T')[0],
        time: localDate.toISOString().split('T')[1].slice(0, 5),
        hero: record.hero || ''
      });
    } else {
      setIsEditing('NEW');
      const now = new Date();
      // Adjust for local timezone
      const offset = now.getTimezoneOffset() * 60000;
      const localNow = new Date(now.getTime() - offset);
      
      setEditForm({
        result: 'LOSS', // Default to Loss as that's usually why people add past records here
        date: localNow.toISOString().split('T')[0],
        time: localNow.toISOString().split('T')[1].slice(0, 5),
        hero: ''
      });
    }
  };

  const handleSaveHistory = () => {
    const timestamp = new Date(`${editForm.date}T${editForm.time}`).getTime();
    
    let newHistory = [...account.history];

    if (isEditing === 'NEW') {
      newHistory.push({
        id: crypto.randomUUID(),
        result: editForm.result,
        timestamp,
        hero: editForm.hero
      });
    } else {
      newHistory = newHistory.map(h => 
        h.id === isEditing 
          ? { ...h, result: editForm.result, timestamp, hero: editForm.hero }
          : h
      );
    }

    onUpdateHistory(account.id, newHistory);
    setIsEditing(null);
  };

  const handleDelete = (id: string) => {
    // Standard browser confirm
    if (window.confirm('确定要永久删除这条战绩记录吗？')) {
      const newHistory = account.history.filter(h => h.id !== id);
      onUpdateHistory(account.id, newHistory);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-2xl h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header (Editable) */}
        <div className="flex justify-between items-start p-6 border-b border-slate-700 bg-slate-900/50">
          <div className="flex-1">
            {!isEditingInfo ? (
              <div className="flex items-center gap-3">
                <div>
                   <h2 className="text-xl font-bold text-white flex items-center gap-2">
                     {account.name}
                     <span className={`text-xs px-2 py-0.5 rounded border ${account.platform === 'WECHAT' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-900/20' : 'border-blue-500/30 text-blue-400 bg-blue-900/20'}`}>
                       {account.platform === 'WECHAT' ? '微信区' : 'QQ区'}
                     </span>
                   </h2>
                   <div className="text-sm text-slate-400 mt-1 flex items-center gap-2">
                     <span className="text-indigo-400 font-medium">{account.rank}</span>
                     <span>•</span>
                     <span>账号管理</span>
                   </div>
                </div>
                <button onClick={toggleEditInfo} className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-700 rounded-lg transition-colors" title="修改账号信息">
                  <Edit2 size={16} />
                </button>
              </div>
            ) : (
              <div className="bg-slate-900/80 p-3 rounded-lg border border-indigo-500/30 -mt-2 -ml-2 mr-4">
                 <div className="grid grid-cols-2 gap-3 mb-3">
                    <input 
                      type="text" 
                      value={infoForm.name}
                      onChange={e => setInfoForm({...infoForm, name: e.target.value})}
                      className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-white w-full"
                      placeholder="账号名称"
                    />
                    <select
                      value={infoForm.rank}
                      onChange={e => setInfoForm({...infoForm, rank: e.target.value as Rank})}
                      className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-white w-full"
                    >
                      {Object.values(Rank).map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                 </div>
                 <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                       <button 
                         onClick={() => setInfoForm({...infoForm, platform: 'WECHAT'})}
                         className={`text-xs px-2 py-1 rounded border ${infoForm.platform === 'WECHAT' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                       >微信区</button>
                       <button 
                         onClick={() => setInfoForm({...infoForm, platform: 'QQ'})}
                         className={`text-xs px-2 py-1 rounded border ${infoForm.platform === 'QQ' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                       >QQ区</button>
                    </div>
                    <div className="flex gap-2">
                       <button onClick={toggleEditInfo} className="text-xs text-slate-400 hover:text-white px-2">取消</button>
                       <button onClick={handleSaveInfo} className="text-xs bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-500">保存</button>
                    </div>
                 </div>
              </div>
            )}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700">
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'history' ? 'bg-slate-800 text-indigo-400 border-b-2 border-indigo-500' : 'bg-slate-900/30 text-slate-400 hover:text-white'}`}
          >
            <History size={16} /> 历史与编辑
          </button>
          <button 
            onClick={() => setActiveTab('charts')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'charts' ? 'bg-slate-800 text-indigo-400 border-b-2 border-indigo-500' : 'bg-slate-900/30 text-slate-400 hover:text-white'}`}
          >
            <BarChart2 size={16} /> 分析与图表
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-800">
          
          {activeTab === 'charts' && (
             <div className="space-y-6">
               <StatsCharts history={account.history} />
               
               {/* Sanction Analysis Block */}
               <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                     <h3 className="font-bold text-white flex items-center gap-2">
                       <AlertTriangle className={sanction.level === 'SAFE' ? 'text-emerald-500' : sanction.level === 'WARNING' ? 'text-orange-500' : 'text-red-500'} size={20} />
                       账号受制裁/环境分析
                     </h3>
                     <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                       sanction.level === 'SAFE' ? 'bg-emerald-900/30 text-emerald-400' : 
                       sanction.level === 'WARNING' ? 'bg-orange-900/30 text-orange-400' : 
                       'bg-red-900/30 text-red-400'
                     }`}>
                       风险指数: {sanction.score}
                     </span>
                  </div>
                  
                  <div className="text-slate-300 text-sm mb-4 leading-relaxed bg-slate-800/50 p-3 rounded-lg border-l-2 border-slate-600">
                    {sanction.description}
                  </div>

                  {sanction.reasons.length > 0 ? (
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">检测到的风险特征</h4>
                      <ul className="space-y-2">
                        {sanction.reasons.map((reason, idx) => (
                          <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></span>
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-900/10 p-2 rounded">
                      <CheckCircle size={16} />
                      未检测到明显的系统针对特征，请放心游戏。
                    </div>
                  )}
               </div>
             </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              {/* Add New Button (Only if not editing) */}
              {!isEditing && (
                <button 
                  onClick={() => startEdit()}
                  className="w-full py-3 border border-dashed border-slate-600 rounded-lg text-slate-400 hover:text-white hover:border-slate-500 hover:bg-slate-700/50 transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={18} /> 手动添加往期战绩
                </button>
              )}

              {/* Edit Form */}
              {isEditing && (
                <div className="bg-slate-900 border border-indigo-500/30 rounded-lg p-4 mb-4 animate-in fade-in slide-in-from-top-2">
                  <div className="flex justify-between items-center mb-4">
                     <h3 className="font-bold text-white">{isEditing === 'NEW' ? '添加新战绩' : '编辑战绩'}</h3>
                     <button onClick={() => setIsEditing(null)} className="text-slate-400 hover:text-white"><X size={18}/></button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">结果</label>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setEditForm({...editForm, result: 'WIN'})}
                          className={`flex-1 py-2 rounded-md font-bold text-sm ${editForm.result === 'WIN' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                        >
                          胜利
                        </button>
                        <button 
                          onClick={() => setEditForm({...editForm, result: 'LOSS'})}
                          className={`flex-1 py-2 rounded-md font-bold text-sm ${editForm.result === 'LOSS' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                        >
                          战败
                        </button>
                      </div>
                    </div>
                    <div>
                       <label className="block text-xs text-slate-400 mb-1">英雄 (可选)</label>
                       <input 
                         type="text" 
                         value={editForm.hero}
                         onChange={(e) => setEditForm({...editForm, hero: e.target.value})}
                         className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                         placeholder="例如：鲁班七号"
                       />
                    </div>
                    <div>
                       <label className="block text-xs text-slate-400 mb-1">日期</label>
                       <input 
                         type="date" 
                         value={editForm.date}
                         onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                         className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                       />
                    </div>
                    <div>
                       <label className="block text-xs text-slate-400 mb-1">时间</label>
                       <input 
                         type="time" 
                         value={editForm.time}
                         onChange={(e) => setEditForm({...editForm, time: e.target.value})}
                         className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                       />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end gap-2">
                    <button onClick={() => setIsEditing(null)} className="px-3 py-2 text-sm text-slate-400 hover:text-white">取消</button>
                    <button onClick={handleSaveHistory} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-500 flex items-center gap-2">
                      <Save size={16} /> 保存记录
                    </button>
                  </div>
                </div>
              )}

              {/* List */}
              <div className="space-y-2">
                {sortedHistory.length === 0 ? (
                  <div className="text-center text-slate-500 py-8">暂无比赛记录。</div>
                ) : (
                  sortedHistory.map(record => (
                    <div key={record.id} className="group flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-700/50 hover:border-slate-600 transition-colors">
                      <div className="flex items-center gap-4">
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${record.result === 'WIN' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                           {record.result === 'WIN' ? <Trophy size={18} /> : <Skull size={18} />}
                         </div>
                         <div>
                            <div className={`font-bold text-sm ${record.result === 'WIN' ? 'text-emerald-400' : 'text-red-400'}`}>
                              {record.result === 'WIN' ? '胜利' : '战败'} 
                              {record.hero && <span className="text-slate-400 font-normal ml-2 text-xs">使用 {record.hero}</span>}
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-2">
                              <Calendar size={10} />
                              {new Date(record.timestamp).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </div>
                         </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit(record)} className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-900/20 rounded">
                           <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(record.id)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-900/20 rounded">
                           <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};