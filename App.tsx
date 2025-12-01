import React, { useState, useEffect, useRef } from 'react';
import { Plus, ShieldAlert, Swords } from 'lucide-react';
import { Account, MatchRecord, Rank, Platform } from './types';
import { AccountCard } from './components/AccountCard';
import { AddAccountModal } from './components/AddAccountModal';
import { AccountDetailsModal } from './components/AccountDetailsModal';
import { FilterBar } from './components/FilterBar';
import { OverallStats } from './components/OverallStats';
import { calculateAccountStatus } from './utils/gameLogic';

const STORAGE_KEY = 'hok_manager_accounts';

export default function App() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Management Modal
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  // Filters & Settings
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState<Platform | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'UPDATED' | 'RANK' | 'CUSTOM'>('UPDATED');
  const [showProgressBar, setShowProgressBar] = useState(true);

  // Drag & Drop
  const [draggedId, setDraggedId] = useState<string | null>(null);

  // Load & Migration
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed: any[] = JSON.parse(stored);
        // Data Migration: Ensure 'platform' exists
        const migrated = parsed.map(acc => ({
          ...acc,
          platform: acc.platform || 'WECHAT', // Default to WeChat for old data
          ...calculateAccountStatus(acc.history) // Recalculate status
        }));
        setAccounts(migrated);
      } catch (e) {
        console.error("Failed to parse accounts", e);
      }
    }
  }, []);

  // Save
  useEffect(() => {
    if (accounts.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
    }
  }, [accounts]);

  const addAccount = (name: string, rank: Rank, platform: Platform) => {
    const newAccount: Account = {
      id: crypto.randomUUID(),
      name,
      rank,
      platform,
      isBanned: false,
      banExpiresAt: null,
      history: []
    };
    setAccounts(prev => [newAccount, ...prev]);
  };

  const deleteAccount = (id: string) => {
    if (confirm('确定要删除这个账号吗？所有历史数据将丢失。')) {
      setAccounts(prev => prev.filter(a => a.id !== id));
    }
  };

  const handleUpdateHistory = (accountId: string, newHistory: MatchRecord[]) => {
    setAccounts(prev => prev.map(acc => {
      if (acc.id !== accountId) return acc;
      const { isBanned, banExpiresAt } = calculateAccountStatus(newHistory);
      const updatedAccount = { ...acc, history: newHistory, isBanned, banExpiresAt };
      if (selectedAccount && selectedAccount.id === accountId) {
        setSelectedAccount(updatedAccount);
      }
      return updatedAccount;
    }));
  };

  // Allow updating account details (Name, Rank, Platform)
  const handleUpdateAccount = (accountId: string, updates: Partial<Account>) => {
    setAccounts(prev => prev.map(acc => {
      if (acc.id !== accountId) return acc;
      const updatedAccount = { ...acc, ...updates };
      if (selectedAccount && selectedAccount.id === accountId) {
        setSelectedAccount(updatedAccount);
      }
      return updatedAccount;
    }));
  };

  const handleResult = (id: string, result: 'WIN' | 'LOSS') => {
    const account = accounts.find(a => a.id === id);
    if (!account) return;
    const newRecord: MatchRecord = { 
      id: crypto.randomUUID(), 
      result, 
      timestamp: Date.now() 
    };
    handleUpdateHistory(id, [...account.history, newRecord]);
  };

  const handleUnban = (id: string) => {
    setAccounts(prev => prev.map(acc => {
      if (acc.id !== id) return acc;
      return { ...acc, isBanned: false, banExpiresAt: null };
    }));
  };

  // --- Import / Export ---
  const handleExport = () => {
    const dataStr = JSON.stringify(accounts, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `王者荣耀账号数据_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target?.result as string);
          if (Array.isArray(imported)) {
             if(confirm(`发现 ${imported.length} 条账号数据。是否覆盖当前数据？(取消则进行合并)`)) {
                setAccounts(imported);
             } else {
                const currentIds = new Set(accounts.map(a => a.id));
                const newAccounts = imported.filter(a => !currentIds.has(a.id));
                setAccounts([...accounts, ...newAccounts]);
                alert(`已合并 ${newAccounts.length} 个新账号。`);
             }
          }
        } catch (err) {
          alert('文件格式错误');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // --- Drag & Drop ---
  const handleDragStart = (e: React.DragEvent, id: string) => {
    if (sortBy !== 'CUSTOM') return; 
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (sortBy !== 'CUSTOM') return;
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    if (sortBy !== 'CUSTOM') return;
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const oldIndex = accounts.findIndex(a => a.id === draggedId);
    const newIndex = accounts.findIndex(a => a.id === targetId);

    if (oldIndex === -1 || newIndex === -1) return;

    const newAccounts = [...accounts];
    const [removed] = newAccounts.splice(oldIndex, 1);
    newAccounts.splice(newIndex, 0, removed);
    
    setAccounts(newAccounts);
    setDraggedId(null);
  };

  // --- Filtering & Sorting ---
  const filteredAccounts = accounts
    .filter(acc => {
       const matchesSearch = acc.name.toLowerCase().includes(searchTerm.toLowerCase()) || acc.rank.includes(searchTerm);
       const matchesPlatform = platformFilter === 'ALL' || acc.platform === platformFilter;
       return matchesSearch && matchesPlatform;
    })
    .sort((a, b) => {
      if (sortBy === 'CUSTOM') return 0;
      if (sortBy === 'RANK') {
        const rankOrder = Object.values(Rank);
        return rankOrder.indexOf(b.rank) - rankOrder.indexOf(a.rank);
      }
      const getLastTime = (acc: Account) => acc.history.length > 0 ? acc.history[acc.history.length-1].timestamp : 0;
      return getLastTime(b) - getLastTime(a);
    });


  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 selection:bg-indigo-500/30">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-3 rounded-xl shadow-lg shadow-indigo-500/20">
              <Swords className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">王者荣耀 <span className="text-indigo-400">账号管理系统</span></h1>
              <p className="text-slate-400 text-sm mt-1 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                自律协议：输一局，封三天
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-lg font-medium shadow-lg shadow-indigo-900/20 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            添加账号
          </button>
        </header>

        {/* Stats Dashboard */}
        <OverallStats accounts={accounts} />

        {/* Filters & Tools */}
        <FilterBar 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          platformFilter={platformFilter}
          onPlatformChange={setPlatformFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
          showProgressBar={showProgressBar}
          onToggleProgressBar={() => setShowProgressBar(!showProgressBar)}
          onExport={handleExport}
          onImport={handleImport}
        />

        {/* Content */}
        {accounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-900/50 rounded-2xl border border-slate-800 border-dashed">
            <div className="bg-slate-800 p-4 rounded-full mb-4 opacity-50">
               <Swords className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-medium text-slate-300 mb-2">暂无追踪账号</h3>
            <p className="text-slate-500 mb-6 max-w-sm text-center">添加你的游戏账号，开始追踪战绩并执行自律协议。</p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="text-indigo-400 hover:text-indigo-300 font-medium hover:underline"
            >
              创建你的第一个账号
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAccounts.map(account => (
              <AccountCard
                key={account.id}
                account={account}
                onDelete={deleteAccount}
                onResult={handleResult}
                onUnban={handleUnban}
                onOpenDetails={setSelectedAccount}
                draggable={sortBy === 'CUSTOM'}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                showProgressBar={showProgressBar}
              />
            ))}
          </div>
        )}
      </div>

      <AddAccountModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={addAccount}
      />

      {selectedAccount && (
        <AccountDetailsModal 
          isOpen={!!selectedAccount}
          onClose={() => setSelectedAccount(null)}
          account={selectedAccount}
          onUpdateHistory={handleUpdateHistory}
          onUpdateAccount={handleUpdateAccount}
        />
      )}
    </div>
  );
}