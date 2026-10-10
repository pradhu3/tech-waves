import React from 'react';
import { ConfidenceLabel } from '../types';
import { ShieldCheck, ShieldAlert, Shield } from 'lucide-react';

interface ConfidenceBadgeProps {
  score: number;
  label?: ConfidenceLabel;
  showBar?: boolean;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({ 
  score, 
  label, 
  showBar = false 
}) => {
  const getStyle = () => {
    if (score >= 75) {
      return {
        text: 'text-sky-400',
        bg: 'bg-sky-500/10 border-sky-500/25',
        bar: 'bg-sky-400',
        icon: <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />,
        label: label || 'High'
      };
    } else if (score >= 50) {
      return {
        text: 'text-amber-400',
        bg: 'bg-amber-500/10 border-amber-500/25',
        bar: 'bg-amber-400',
        icon: <Shield className="w-3.5 h-3.5 text-amber-400" />,
        label: label || 'Medium'
      };
    } else {
      return {
        text: 'text-rose-400',
        bg: 'bg-rose-500/10 border-rose-500/25',
        bar: 'bg-rose-400',
        icon: <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />,
        label: label || 'Low'
      };
    }
  };

  const style = getStyle();

  return (
    <div className="inline-flex flex-col gap-1 items-start">
      <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border ${style.bg} ${style.text} text-xs font-mono font-medium`}>
        {style.icon}
        <span>{Math.round(score)}%</span>
        <span className="opacity-75 text-[10px] uppercase font-sans font-semibold tracking-wider ml-0.5">({style.label})</span>
      </div>
      {showBar && (
        <div className="w-full bg-slate-800/80 rounded-full h-1 overflow-hidden border border-slate-700/50">
          <div 
            className={`h-full rounded-full transition-all duration-300 ${style.bar}`} 
            style={{ width: `${Math.min(100, Math.max(5, score))}%` }} 
          />
        </div>
      )}
    </div>
  );
};
