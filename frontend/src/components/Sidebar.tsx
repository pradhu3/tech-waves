import React from 'react';
import {
  LayoutDashboard,
  Upload,
  Search,
  AlertTriangle,
  Layers,
  Ban,
  TrendingDown,
  BarChart3,
  MessageSquareCheck,
  FileCheck2,
  Sliders,
  ChevronRight
} from 'lucide-react';

export type TabId = 
  | 'dashboard' 
  | 'upload' 
  | 'analysis' 
  | 'review-queue' 
  | 'clusters' 
  | 'negatives' 
  | 'spend' 
  | 'campaigns' 
  | 'feedback' 
  | 'reports' 
  | 'settings';

interface SidebarProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  reviewQueueCount?: number;
  negativeKeywordsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  reviewQueueCount = 0,
  negativeKeywordsCount = 0
}) => {
  const navItems = [
    { id: 'dashboard' as TabId, label: 'Overview Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'upload' as TabId, label: 'Upload & Data Preview', icon: <Upload className="w-4 h-4" /> },
    { id: 'analysis' as TabId, label: 'Search Term Analysis', icon: <Search className="w-4 h-4" /> },
    { 
      id: 'review-queue' as TabId, 
      label: 'Human Review Queue', 
      icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
      badge: reviewQueueCount > 0 ? reviewQueueCount : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    },
    { id: 'clusters' as TabId, label: 'Query Clusters', icon: <Layers className="w-4 h-4" /> },
    { 
      id: 'negatives' as TabId, 
      label: 'Negative Keyword Builder', 
      icon: <Ban className="w-4 h-4 text-rose-400" />,
      badge: negativeKeywordsCount > 0 ? negativeKeywordsCount : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
    },
    { id: 'spend' as TabId, label: 'Spend Intelligence', icon: <TrendingDown className="w-4 h-4 text-emerald-400" /> },
    { id: 'campaigns' as TabId, label: 'Campaign Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'feedback' as TabId, label: 'Reviewer Feedback', icon: <MessageSquareCheck className="w-4 h-4" /> },
    { id: 'reports' as TabId, label: 'Audit Reports', icon: <FileCheck2 className="w-4 h-4" /> },
    { id: 'settings' as TabId, label: 'Settings & Help', icon: <Sliders className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 border-r border-navy-700/60 bg-navy-900/50 backdrop-blur-lg flex flex-col justify-between p-3 select-none">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Platform Navigation
        </div>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-sky-500/15 text-sky-300 font-semibold border border-sky-500/30 shadow-sm shadow-sky-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-navy-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={isActive ? 'text-sky-400' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5 ml-2">
                {item.badge !== undefined && (
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-sky-400" />}
              </div>
            </button>
          );
        })}
      </div>

      <div className="p-3 rounded-xl bg-navy-950/60 border border-navy-700/60 text-xs text-slate-400 mt-4">
        <p className="font-semibold text-slate-300 text-[11px] mb-1">Explainable AI Core</p>
        <p className="text-[11px] leading-relaxed text-slate-400">
          Uncertainty-aware engine routing sparse samples & high spend to manual oversight.
        </p>
      </div>
    </aside>
  );
};
