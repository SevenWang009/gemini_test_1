
import React from 'react';
import { Search, Filter, ArrowUpDown, Download, Upload, GripVertical } from 'lucide-react';
import { Platform, Rank } from '../types';

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  platformFilter: Platform | 'ALL';
  onPlatformChange: (val: Platform | 'ALL') => void;
  sortBy: 'UPDATED' | 'RANK' | 'CUSTOM';
  onSortChange: (val: 'UPDATED' | 'RANK' | 'CUSTOM') => void;
  showProgressBar: boolean;
  onToggleProgressBar: () => void;
  onExport: () => void;
  onImport: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchTerm,
  onSearchChange,
  platformFilter,
  onPlatformChange,
  sortBy,
  onSortChange,
  showProgressBar,
  onToggleProgressBar,
  onExport,
  onImport
}) => {
  return (
    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 mb-6 flex flex-col lg:flex-row gap-4 justify-between lg:items-center">
      
      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="搜索账号或段位..."
            className="w-full sm:w-60 bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button 
            onClick={() => onPlatformChange('ALL')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${platformFilter === 'ALL' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
          >
            全部大区
          </button>
          <button 
            onClick={() => onPlatformChange('WECHAT')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${platformFilter === 'WECHAT' ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
          >
            微信区
          </button>
          <button 
            onClick={() => onPlatformChange('QQ')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${platformFilter === 'QQ' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
          >
            QQ区
          </button>
        </div>
      </div>

      {/* Settings & Actions */}
      <div className="flex flex-wrap items-center gap-3 border-t lg:border-t-0 border-slate-700 pt-3 lg:pt-0">
        {/* Sort */}
        <div className="flex items-center gap-2 border-r border-slate-700 pr-3">
          <ArrowUpDown className="w-4 h-4 text-slate-500" />
          <select 
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as any)}
            className="bg-slate-900 border-none text-xs text-slate-300 rounded focus:ring-0 cursor-pointer"
          >
            <option value="UPDATED">最近更新</option>
            <option value="RANK">段位高低</option>
            <option value="CUSTOM">自定义排序 (可拖拽)</option>
          </select>
        </div>

        {/* Toggle Progress Bar */}
        <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-300 hover:text-white">
          <input 
            type="checkbox" 
            checked={showProgressBar} 
            onChange={onToggleProgressBar}
            className="rounded bg-slate-700 border-slate-600 text-indigo-600 focus:ring-offset-slate-800"
          />
          显示解封进度条
        </label>

        {/* Data Actions */}
        <div className="flex items-center gap-2 pl-2">
          <button 
            onClick={onExport}
            className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-700 rounded-lg transition-colors" 
            title="导出数据备份"
          >
            <Download size={18} />
          </button>
          <button 
            onClick={onImport}
            className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-700 rounded-lg transition-colors" 
            title="导入数据恢复"
          >
            <Upload size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
