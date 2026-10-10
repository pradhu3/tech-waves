import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  trendPositive?: boolean;
  accentColor?: 'sky' | 'emerald' | 'rose' | 'amber' | 'slate';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendPositive,
  accentColor = 'sky',
  onClick
}) => {
  const colorMap = {
    sky: 'border-sky-500/20 from-sky-500/10 to-transparent hover:border-sky-500/40 text-sky-400',
    emerald: 'border-emerald-500/20 from-emerald-500/10 to-transparent hover:border-emerald-500/40 text-emerald-400',
    rose: 'border-rose-500/20 from-rose-500/10 to-transparent hover:border-rose-500/40 text-rose-400',
    amber: 'border-amber-500/20 from-amber-500/10 to-transparent hover:border-amber-500/40 text-amber-400',
    slate: 'border-slate-500/20 from-slate-500/10 to-transparent hover:border-slate-500/40 text-slate-400',
  };

  return (
    <div 
      onClick={onClick}
      className={`glass-panel bg-gradient-to-br ${colorMap[accentColor]} p-5 rounded-2xl relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{title}</p>
          <h3 className="text-2xl font-bold tracking-tight text-white">{value}</h3>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-1 line-clamp-1">{subtitle}</p>
          )}
          {trend && (
            <div className="mt-2.5 flex items-center gap-1.5">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${trendPositive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'}`}>
                {trend}
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-slate-900/60 border border-slate-700/50 shadow-inner ${colorMap[accentColor].split(' ').pop()}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};
