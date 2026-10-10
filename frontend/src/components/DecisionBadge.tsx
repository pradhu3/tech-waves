import React from 'react';
import { Decision } from '../types';
import { CheckCircle2, Ban, EyeOff, AlertTriangle } from 'lucide-react';

interface DecisionBadgeProps {
  decision: Decision | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const DecisionBadge: React.FC<DecisionBadgeProps> = ({ 
  decision, 
  size = 'md',
  showIcon = true 
}) => {
  const getBadgeStyle = () => {
    switch (decision) {
      case 'PROMOTE':
        return {
          bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
          dot: 'bg-emerald-400 shadow-[0_0_8px_#10b981]',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        };
      case 'BLOCK':
        return {
          bg: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
          dot: 'bg-rose-400 shadow-[0_0_8px_#ef4444]',
          icon: <Ban className="w-3.5 h-3.5 text-rose-400" />
        };
      case 'HUMAN REVIEW':
        return {
          bg: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
          dot: 'bg-amber-400 shadow-[0_0_8px_#f59e0b]',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
        };
      case 'IGNORE':
      default:
        return {
          bg: 'bg-slate-500/15 border-slate-500/30 text-slate-400',
          dot: 'bg-slate-400',
          icon: <EyeOff className="w-3.5 h-3.5 text-slate-400" />
        };
    }
  };

  const style = getBadgeStyle();
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-semibold gap-1.5',
    md: 'px-2.5 py-1 text-xs font-semibold gap-2',
    lg: 'px-3 py-1.5 text-sm font-bold gap-2.5',
  }[size];

  return (
    <span className={`inline-flex items-center rounded-full border ${style.bg} ${sizeClasses} tracking-wide transition-all duration-200 shadow-sm`}>
      {showIcon && style.icon}
      <span>{decision}</span>
    </span>
  );
};
