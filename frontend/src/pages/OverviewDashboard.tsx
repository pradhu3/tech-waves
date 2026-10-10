import React from 'react';
import { DashboardSummary, SearchTermRecord } from '../types';
import { StatCard } from '../components/StatCard';
import { DecisionBadge } from '../components/DecisionBadge';
import { ConfidenceBadge } from '../components/ConfidenceBadge';
import {
  Search,
  CheckCircle2,
  Ban,
  EyeOff,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Percent,
  UploadCloud,
  ChevronRight,
  TrendingDown,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Legend 
} from 'recharts';

interface OverviewDashboardProps {
  summary: DashboardSummary | null;
  onNavigateTab: (tab: any) => void;
  onSelectRecord: (record: SearchTermRecord) => void;
  highSpendRecords: SearchTermRecord[];
  onLoadDemo: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  summary,
  onNavigateTab,
  onSelectRecord,
  highSpendRecords,
  onLoadDemo
}) => {
  if (!summary) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Loading dashboard intelligence...</p>
        </div>
      </div>
    );
  }

  const { decision_counts, kpi_metrics, confidence_counts, spend_intelligence } = summary;

  // Chart data preparation
  const decisionData = [
    { name: 'PROMOTE', value: decision_counts.PROMOTE, color: '#10b981' },
    { name: 'BLOCK', value: decision_counts.BLOCK, color: '#ef4444' },
    { name: 'HUMAN REVIEW', value: decision_counts['HUMAN REVIEW'], color: '#f59e0b' },
    { name: 'IGNORE', value: decision_counts.IGNORE, color: '#64748b' },
  ];

  const spendData = [
    { name: 'PROMOTE', spend: spend_intelligence.promote_spend, color: '#10b981' },
    { name: 'BLOCK', spend: spend_intelligence.blocked_spend, color: '#ef4444' },
    { name: 'REVIEW', spend: spend_intelligence.review_spend, color: '#f59e0b' },
    { name: 'IGNORE', spend: spend_intelligence.ignore_spend, color: '#64748b' },
  ];

  const confidenceData = [
    { name: 'High (>=75%)', count: confidence_counts.High, color: '#38bdf8' },
    { name: 'Medium (50-74%)', count: confidence_counts.Medium, color: '#f59e0b' },
    { name: 'Low (<50%)', count: confidence_counts.Low, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">

      {/* Hero Welcome & Quick Stats Banner */}
      <div className="glass-panel p-6 rounded-2xl border-sky-500/20 bg-gradient-to-r from-navy-900 via-navy-850 to-sky-950/40 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-sky-500/20 text-sky-400 uppercase tracking-wider">
              Google Ads Triage
            </span>
            {summary.is_demo && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-500/20 text-amber-400 uppercase tracking-wider">
                Demo Dataset Loaded
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight m-0">
            Search Term Intelligence Overview
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl m-0 leading-relaxed">
            Automated, explainable decision matrix for raw search queries. Identifies proven high-converting keywords, eliminates budget leakage, and flags sparse samples for human oversight.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigateTab('upload')}
            className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 rounded-xl shadow-lg shadow-sky-500/20 transition active:scale-95 flex items-center gap-2"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload New CSV</span>
          </button>
          {summary.is_demo ? (
            <button
              onClick={() => onNavigateTab('review-queue')}
              className="px-4 py-2 text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl transition flex items-center gap-1.5"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Review Backlog ({decision_counts['HUMAN REVIEW']})</span>
            </button>
          ) : (
            <button
              onClick={onLoadDemo}
              className="px-3.5 py-2 text-xs font-semibold text-slate-300 bg-navy-800/80 hover:bg-navy-800 border border-navy-700 rounded-xl transition"
            >
              Load Demo Data
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Queries Analysed"
          value={summary.total_processed.toLocaleString()}
          subtitle={`${summary.total_rejected} rejected malformed rows`}
          icon={<Search className="w-5 h-5 text-sky-400" />}
          accentColor="sky"
          onClick={() => onNavigateTab('analysis')}
        />
        <StatCard
          title="Promote Recommendations"
          value={decision_counts.PROMOTE.toLocaleString()}
          subtitle="Strong commercial proof & profitable CPA"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          accentColor="emerald"
          onClick={() => onNavigateTab('analysis')}
        />
        <StatCard
          title="Block (Negative Terms)"
          value={decision_counts.BLOCK.toLocaleString()}
          subtitle={`$${spend_intelligence.blocked_spend.toFixed(2)} historical leakage`}
          icon={<Ban className="w-5 h-5 text-rose-400" />}
          accentColor="rose"
          onClick={() => onNavigateTab('negatives')}
        />
        <StatCard
          title="Human Review Queue"
          value={decision_counts['HUMAN REVIEW'].toLocaleString()}
          subtitle="Sparse samples & ambiguous intent"
          icon={<AlertTriangle className="w-5 h-5 text-amber-400" />}
          accentColor="amber"
          onClick={() => onNavigateTab('review-queue')}
        />
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Account Spend"
          value={`$${kpi_metrics.total_spend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle={`${kpi_metrics.total_clicks.toLocaleString()} total clicks`}
          icon={<DollarSign className="w-5 h-5 text-sky-400" />}
          accentColor="sky"
        />
        <StatCard
          title="Avoidable Spend Model"
          value={`$${spend_intelligence.estimated_avoidable_spend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle={`${spend_intelligence.avoidable_spend_percentage}% of total account spend`}
          icon={<TrendingDown className="w-5 h-5 text-emerald-400" />}
          accentColor="emerald"
          onClick={() => onNavigateTab('spend')}
        />
        <StatCard
          title="Total Conversions"
          value={kpi_metrics.total_conversions.toLocaleString()}
          subtitle={`Avg CPA: $${kpi_metrics.total_conversions > 0 ? (kpi_metrics.total_spend / kpi_metrics.total_conversions).toFixed(2) : '0.00'}`}
          icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
          accentColor="emerald"
        />
        <StatCard
          title="Conversion Revenue"
          value={`$${kpi_metrics.total_conversion_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle={`Account ROAS: ${kpi_metrics.total_spend > 0 ? (kpi_metrics.total_conversion_value / kpi_metrics.total_spend).toFixed(2) : '0.00'}x`}
          icon={<Percent className="w-5 h-5 text-sky-400" />}
          accentColor="sky"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 1. Decision Breakdown Pie Chart */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
              Decision Distribution
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Classification breakdown across all evaluated search queries
            </p>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={decisionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {decisionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0c1322', borderColor: '#1e3054', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-navy-800 text-xs">
            {decisionData.map((d) => (
              <div key={d.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-slate-400 truncate">{d.name}:</span>
                <strong className="text-white ml-auto">{d.value}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Spend Allocation Bar Chart */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
              Spend by Recommendation ($)
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Budget allocation across decision categories
            </p>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={spendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e3054" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `$${v}`} />
                <Tooltip 
                  formatter={(val: any) => [`$${Number(val).toFixed(2)}`, 'Spend']}
                  contentStyle={{ backgroundColor: '#0c1322', borderColor: '#1e3054', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="spend" radius={[6, 6, 0, 0]}>
                  {spendData.map((entry, index) => (
                    <Cell key={`spend-cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="pt-2 border-t border-navy-800 text-xs text-slate-400 flex justify-between items-center">
            <span>Blocked Leakage:</span>
            <strong className="text-rose-400">${spend_intelligence.blocked_spend.toFixed(2)}</strong>
          </div>
        </div>

        {/* 3. Confidence Distribution Chart */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
              Confidence &amp; Uncertainty Tiers
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Quantified metric completeness and statistical certainty
            </p>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={confidenceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e3054" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0c1322', borderColor: '#1e3054', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {confidenceData.map((entry, index) => (
                    <Cell key={`conf-cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="pt-2 border-t border-navy-800 text-xs text-slate-400 flex justify-between items-center">
            <span>High Confidence Rate:</span>
            <strong className="text-sky-400">
              {summary.total_processed > 0 ? Math.round((confidence_counts.High / summary.total_processed) * 100) : 0}%
            </strong>
          </div>
        </div>

      </div>

      {/* High-Spend Attention Queries */}
      <div className="glass-panel p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight m-0">
              High-Spend Queries Requiring Attention
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 m-0">
              Queries with notable financial footprint flagged for BLOCK or HUMAN REVIEW
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('analysis')}
            className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 transition"
          >
            <span>View All Queries</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-navy-700/80 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3">Search Term</th>
                <th className="py-3 px-3">Campaign / Ad Group</th>
                <th className="py-3 px-3 text-right">Clicks</th>
                <th className="py-3 px-3 text-right">Cost</th>
                <th className="py-3 px-3 text-right">Conversions</th>
                <th className="py-3 px-3 text-center">Decision</th>
                <th className="py-3 px-3 text-center">Confidence</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60">
              {highSpendRecords.slice(0, 7).map((row) => (
                <tr 
                  key={row.row_id} 
                  className="hover:bg-navy-850/60 transition group cursor-pointer"
                  onClick={() => onSelectRecord(row)}
                >
                  <td className="py-3 px-3 font-semibold text-white max-w-xs truncate">
                    "{row.search_term}"
                  </td>
                  <td className="py-3 px-3 text-slate-400">
                    <span className="text-slate-300">{row.campaign}</span>
                    <span className="text-slate-500 text-[10px] block">{row.ad_group}</span>
                  </td>
                  <td className="py-3 px-3 text-right text-slate-300 font-mono">
                    {row.clicks ?? 'N/A'}
                  </td>
                  <td className="py-3 px-3 text-right text-rose-400 font-mono font-bold">
                    ${row.cost ? row.cost.toFixed(2) : '0.00'}
                  </td>
                  <td className="py-3 px-3 text-right text-emerald-400 font-mono font-bold">
                    {row.conversions ?? 0}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <DecisionBadge decision={row.recommendation} size="sm" />
                  </td>
                  <td className="py-3 px-3 text-center">
                    <ConfidenceBadge score={row.confidence} label={row.confidence_label} />
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectRecord(row);
                      }}
                      className="p-1.5 rounded-lg bg-navy-800 hover:bg-sky-500/20 text-slate-400 hover:text-sky-300 transition"
                      title="Inspect evidence drawer"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
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
