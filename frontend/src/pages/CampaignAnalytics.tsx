import React from 'react';
import { CampaignSummary } from '../types';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Percent,
  Calendar,
  Layers
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface CampaignAnalyticsProps {
  campaignSummaries: CampaignSummary[];
}

export const CampaignAnalytics: React.FC<CampaignAnalyticsProps> = ({ campaignSummaries }) => {
  return (
    <div className="space-y-6">

      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border-sky-500/20 bg-gradient-to-r from-navy-900 via-navy-850 to-blue-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-sky-500/20 text-sky-400 uppercase tracking-wider flex items-center gap-1">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Multi-Campaign Aggregations</span>
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight m-0">
            Campaign &amp; Ad-Group Performance Analytics
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl m-0 leading-relaxed">
            Consolidated account structure performance derived purely from verified uploaded search records. Discloses review backlogs and efficiency ratios per campaign.
          </p>
        </div>

        {/* Date Time-Series Notice */}
        <div className="p-3 rounded-xl bg-navy-950/80 border border-navy-800 text-xs text-slate-400 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-sky-400 shrink-0" />
          <span>Single Snapshot Period Active</span>
        </div>
      </div>

      {/* Main Campaign Summary Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border-navy-700/80">
        <div className="p-5 border-b border-navy-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider m-0">
            Campaign Performance Breakdown
          </h3>
          <span className="text-xs text-slate-400">
            {campaignSummaries.length} campaigns active in dataset
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-navy-700/80 bg-navy-900/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider select-none">
                <th className="py-3 px-3">Campaign Name</th>
                <th className="py-3 px-3 text-right">Queries</th>
                <th className="py-3 px-3 text-right">Total Spend</th>
                <th className="py-3 px-3 text-right">Blocked Spend</th>
                <th className="py-3 px-3 text-right">Review Spend</th>
                <th className="py-3 px-3 text-right">Conversions</th>
                <th className="py-3 px-3 text-right">Revenue</th>
                <th className="py-3 px-3 text-right">CPA ($)</th>
                <th className="py-3 px-3 text-right">ROAS</th>
                <th className="py-3 px-3 text-center">Waste Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60">
              {campaignSummaries.map((c) => (
                <tr key={c.campaign} className="hover:bg-navy-850/60 transition">
                  <td className="py-3 px-3 font-bold text-white max-w-xs truncate" title={c.campaign}>
                    {c.campaign}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-300">
                    {c.query_count}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-white">
                    ${c.total_spend.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-rose-400 font-bold">
                    ${c.blocked_spend.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-amber-400">
                    ${c.review_spend.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                    {c.conversions.toFixed(1)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-sky-400">
                    ${c.conversion_value.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-300">
                    {c.cpa !== null && c.cpa !== undefined ? `$${c.cpa.toFixed(2)}` : 'N/A'}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-300">
                    {c.roas !== null && c.roas !== undefined ? `${c.roas.toFixed(2)}x` : 'N/A'}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      c.potential_savings_rate > 20
                        ? 'bg-rose-500/20 text-rose-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {c.potential_savings_rate.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
