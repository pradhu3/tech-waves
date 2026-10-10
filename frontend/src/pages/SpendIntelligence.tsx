import React, { useState } from 'react';
import { SpendIntelligence as SpendIntelType, SearchTermRecord } from '../types';
import { StatCard } from '../components/StatCard';
import { api } from '../services/api';
import {
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Sliders,
  ShieldCheck,
  HelpCircle,
  BarChart2,
  Layers,
  ArrowRight
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface SpendIntelligenceProps {
  spendIntel: SpendIntelType | null;
  onSelectRecordById: (rowId: string) => void;
  onRefreshSummary: () => void;
}

export const SpendIntelligence: React.FC<SpendIntelligenceProps> = ({
  spendIntel,
  onSelectRecordById,
  onRefreshSummary
}) => {
  const [cutoffThreshold, setCutoffThreshold] = useState(30);
  const [adoptionRate, setAdoptionRate] = useState(90);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationData, setSimulationData] = useState<SpendIntelType | null>(null);

  if (!spendIntel) {
    return (
      <div className="glass-panel p-12 text-center text-slate-400 rounded-2xl">
        <p className="text-sm">Calculating spend intelligence from active dataset...</p>
      </div>
    );
  }

  const activeData = simulationData || spendIntel;

  const handleRunSimulation = async (cutoff: number, rate: number) => {
    setIsSimulating(true);
    try {
      const res = await api.simulateSpend({
        negative_spend_cutoff: cutoff,
        negative_adoption_rate: rate / 100
      });
      setSimulationData(res.simulation_results);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  // Campaign chart data
  const campaignChartData = activeData.campaign_summaries.slice(0, 8).map(c => ({
    name: c.campaign.length > 15 ? `${c.campaign.substring(0, 15)}...` : c.campaign,
    total: c.total_spend,
    blocked: c.blocked_spend,
    review: c.review_spend
  }));

  return (
    <div className="space-y-6">

      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border-emerald-500/30 bg-gradient-to-r from-navy-900 via-navy-850 to-emerald-950/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/20 text-emerald-400 uppercase tracking-wider flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Financial &amp; Waste Analytics</span>
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight m-0">
            Wasted-Spend &amp; Budget Optimization Intelligence
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl m-0 leading-relaxed">
            Distinguishes verified historical spend, confirmed non-commercial leakage (BLOCK), and spend flagged for investigation (HUMAN REVIEW). Avoids double counting and unsubstantiated claims.
          </p>
        </div>
      </div>

      {/* Distinct Spend Categories KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Historical Spend"
          value={`$${activeData.total_spend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle="Total spend across uploaded query records"
          icon={<DollarSign className="w-5 h-5 text-sky-400" />}
          accentColor="sky"
        />
        <StatCard
          title="Confirmed Block Leakage"
          value={`$${activeData.blocked_spend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle={`${activeData.blocked_spend_percentage}% of total spend (Irrelevant intent)`}
          icon={<TrendingDown className="w-5 h-5 text-rose-400" />}
          accentColor="rose"
        />
        <StatCard
          title="Spend Under Investigation"
          value={`$${activeData.review_spend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle={`${activeData.review_spend_percentage}% held in Human Review queue`}
          icon={<AlertTriangle className="w-5 h-5 text-amber-400" />}
          accentColor="amber"
        />
        <StatCard
          title="Model Avoidable Spend"
          value={`$${activeData.estimated_avoidable_spend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle={`${activeData.avoidable_spend_percentage}% simulated savings run-rate`}
          icon={<ShieldCheck className="w-5 h-5 text-emerald-400" />}
          accentColor="emerald"
        />
      </div>

      {/* Methodology & Assumptions Disclosure */}
      <div className="p-5 rounded-2xl bg-sky-950/30 border border-sky-500/30 space-y-2 text-xs">
        <div className="flex items-center gap-2 font-bold text-sky-300 uppercase tracking-wider text-[11px]">
          <HelpCircle className="w-4 h-4 text-sky-400" />
          <span>Accounting Model Assumptions &amp; Safeguards</span>
        </div>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-300 pl-4 list-disc">
          {activeData.assumptions.map((item, idx) => (
            <li key={idx} className="leading-relaxed">{item}</li>
          ))}
        </ul>
      </div>

      {/* Interactive What-If Scenario Simulator */}
      <div className="glass-panel p-6 rounded-2xl border-navy-700/80 bg-gradient-to-br from-navy-900 to-navy-950">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-sky-400" />
            <h3 className="text-base font-bold text-white tracking-tight m-0">
              Interactive What-If Scenario Simulator
            </h3>
          </div>
          <span className="text-[11px] font-mono text-sky-300 bg-sky-500/10 px-2.5 py-1 rounded-full border border-sky-500/20">
            Real-time projection model
          </span>
        </div>

        <p className="text-xs text-slate-400 mb-6 max-w-2xl">
          Adjust the historical spend cutoff point before an analyst would have introduced a negative keyword, and calibrate your organization's negative keyword adoption rate.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-xl bg-navy-950/70 border border-navy-800">
          
          {/* Slider 1: Spend Cutoff */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300">Negative Introduction Spend Threshold:</span>
              <strong className="text-sky-400 font-mono text-sm">${cutoffThreshold}</strong>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              step={5}
              value={cutoffThreshold}
              onChange={(e) => {
                const val = Number(e.target.value);
                setCutoffThreshold(val);
                handleRunSimulation(val, adoptionRate);
              }}
              className="w-full accent-sky-400 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 block">
              Excess spend beyond ${cutoffThreshold} on BLOCK terms is treated as avoidable waste.
            </span>
          </div>

          {/* Slider 2: Adoption Rate */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300">Analyst Negative Keyword Adoption Rate:</span>
              <strong className="text-emerald-400 font-mono text-sm">{adoptionRate}%</strong>
            </div>
            <input
              type="range"
              min={50}
              max={100}
              step={5}
              value={adoptionRate}
              onChange={(e) => {
                const val = Number(e.target.value);
                setAdoptionRate(val);
                handleRunSimulation(cutoffThreshold, val);
              }}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 block">
              Percentage of proposed negative keywords approved and implemented in Google Ads.
            </span>
          </div>

        </div>

        {/* Projected Impact Box */}
        <div className="mt-4 p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
              Projected Avoidable Spend at Configured Thresholds:
            </span>
            <p className="text-2xl font-bold text-white mt-1 mb-0 font-mono">
              ${activeData.estimated_avoidable_spend.toFixed(2)}
              <span className="text-xs text-emerald-400 ml-2 font-normal font-sans">
                ({activeData.avoidable_spend_percentage}% overall reduction potential)
              </span>
            </p>
          </div>
          <div className="text-xs text-slate-400 max-w-xs text-right">
            Annualized run-rate reinvestment capacity: <strong className="text-white">${(activeData.estimated_avoidable_spend * 12).toFixed(2)}/yr</strong>
          </div>
        </div>
      </div>

      {/* Campaign Spend & Investigation Queries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Campaign Breakdown Bar Chart */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
              Spend vs. Blocked Waste by Campaign
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Comparing total expenditure against confirmed non-commercial leakage
            </p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={campaignChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e3054" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} angle={-20} textAnchor="end" />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `$${v}`} />
                <Tooltip 
                  formatter={(val: any) => [`$${Number(val).toFixed(2)}`, '']}
                  contentStyle={{ backgroundColor: '#0c1322', borderColor: '#1e3054', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="total" name="Total Spend" fill="#0284c7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="blocked" name="Blocked Leakage" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* High-Cost Search Terms Under Investigation */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
              Top At-Risk Search Terms
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              Queries with notable spend held in Human Review queue
            </p>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-64 pr-1">
            {activeData.high_cost_investigations.slice(0, 6).map((item) => (
              <div 
                key={item.row_id}
                onClick={() => onSelectRecordById(item.row_id)}
                className="p-3 rounded-xl bg-navy-950/60 border border-navy-800 hover:border-sky-500/40 transition cursor-pointer flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0">
                  <p className="font-bold text-white truncate m-0">"{item.search_term}"</p>
                  <p className="text-[11px] text-slate-400 truncate m-0">{item.campaign}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-rose-400 font-mono block">${item.cost.toFixed(2)}</span>
                  <span className="text-[10px] text-slate-500">{item.conversions} conv.</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-navy-800 text-xs text-slate-400 text-center">
            Click any item to inspect evidence and apply human decision.
          </div>
        </div>

      </div>

    </div>
  );
};
