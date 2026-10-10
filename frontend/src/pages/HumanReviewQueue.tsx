import React, { useState, useEffect } from 'react';
import { SearchTermRecord, Decision } from '../types';
import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { api } from '../services/api';
import {
  AlertTriangle,
  CheckCircle2,
  Ban,
  EyeOff,
  Eye,
  RefreshCw,
  HelpCircle,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

interface HumanReviewQueueProps {
  onSelectRecord: (record: SearchTermRecord) => void;
  onRefreshSummary: () => void;
}

export const HumanReviewQueue: React.FC<HumanReviewQueueProps> = ({
  onSelectRecord,
  onRefreshSummary
}) => {
  const [queueItems, setQueueItems] = useState<SearchTermRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'LOW_SAMPLE' | 'CONFLICTING' | 'AMBIGUOUS' | 'MISSING'>('ALL');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const fetchQueue = async () => {
    setIsLoading(true);
    try {
      const data = await api.getReviewQueue();
      setQueueItems(data.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleQuickDecision = async (row_id: string, decision: Decision) => {
    setActionInProgress(row_id);
    try {
      await api.submitReview(row_id, decision, `Resolved via Review Queue to ${decision}`, 'Human Review queue action');
      await fetchQueue();
      onRefreshSummary();
    } catch (err) {
      console.error(err);
    } finally {
      setActionInProgress(null);
    }
  };

  const filteredItems = queueItems.filter(item => {
    if (selectedFilter === 'ALL') return true;
    if (selectedFilter === 'LOW_SAMPLE') {
      return item.rules_triggered.includes('RULE_LOW_SAMPLE_CONVERSION_ANOMALY') || (item.clicks !== null && item.clicks !== undefined && item.clicks <= 5);
    }
    if (selectedFilter === 'CONFLICTING') {
      return item.rules_triggered.includes('RULE_HIGH_SPEND_ZERO_CONVERSIONS') || item.uncertainty_factors.some(u => u.toLowerCase().includes('conflict'));
    }
    if (selectedFilter === 'AMBIGUOUS') {
      return item.intent_type === 'ambiguous' || item.rules_triggered.includes('RULE_AMBIGUOUS_QUERY_INTENT');
    }
    if (selectedFilter === 'MISSING') {
      return item.missing_data.length > 0 || item.rules_triggered.includes('RULE_CRITICAL_METRIC_MISSING');
    }
    return true;
  });

  return (
    <div className="space-y-6">

      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border-amber-500/30 bg-gradient-to-r from-navy-900 via-navy-850 to-amber-950/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-500/20 text-amber-400 uppercase tracking-wider flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Uncertainty Safeguard Queue</span>
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight m-0">
            Dedicated Human Review Backlog ({queueItems.length} Terms)
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl m-0 leading-relaxed">
            Search queries held from automatic Google Ads action due to small sample sizes (e.g. 2 clicks with 1 conversion fluke), ambiguous commercial intent, or conflicting performance metrics.
          </p>
        </div>

        <button
          onClick={fetchQueue}
          className="px-3.5 py-2 text-xs font-semibold text-slate-300 bg-navy-800 hover:bg-navy-700 border border-navy-700 rounded-xl transition flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: 'ALL', label: `All In Queue (${queueItems.length})` },
          { id: 'LOW_SAMPLE', label: 'Sparse Samples / Low Clicks' },
          { id: 'CONFLICTING', label: 'High Spend Zero Conversions' },
          { id: 'AMBIGUOUS', label: 'Ambiguous Query Intent' },
          { id: 'MISSING', label: 'Missing Metrics' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedFilter(tab.id as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              selectedFilter === tab.id
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'bg-navy-900/60 text-slate-400 border border-navy-800 hover:text-white hover:bg-navy-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Items List */}
      {isLoading ? (
        <div className="glass-panel p-12 text-center text-slate-400 rounded-2xl">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-400" />
          <span>Loading uncertain triage cases...</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border-emerald-500/20">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
          <h3 className="text-base font-bold text-white mb-1">Queue is Clear!</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            All flagged terms in this category have been resolved by analysts or classified with high confidence.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <div
              key={item.row_id}
              className="glass-panel p-5 rounded-2xl border-navy-700/80 hover:border-amber-500/40 transition group"
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                
                {/* Query Info & Explanation */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-mono text-slate-400 bg-navy-800 px-2 py-0.5 rounded">
                      {item.row_id}
                    </span>
                    <span className="text-xs text-slate-400">
                      {item.campaign} &gt; {item.ad_group}
                    </span>
                    <ConfidenceBadge score={item.confidence} label={item.confidence_label} />
                  </div>

                  <h3 className="text-base font-bold text-white tracking-tight mb-2 truncate" title={item.search_term}>
                    "{item.search_term}"
                  </h3>

                  <p className="text-xs text-amber-200/90 leading-relaxed mb-3 bg-amber-950/30 p-2.5 rounded-xl border border-amber-500/20">
                    <strong className="text-amber-400">Uncertainty Flag:</strong> {item.explanation}
                  </p>

                  {/* Metrics Pill Grid */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono">
                    <span>Clicks: <strong className="text-white">{item.clicks ?? '-'}</strong></span>
                    <span>Cost: <strong className="text-rose-400">${item.cost ? item.cost.toFixed(2) : '0.00'}</strong></span>
                    <span>Conv: <strong className="text-emerald-400">{item.conversions ?? 0}</strong></span>
                    <span>CTR: <strong className="text-sky-300">{item.ctr ? `${item.ctr}%` : 'N/A'}</strong></span>
                    <span>CPA: <strong className="text-amber-300">{item.cpa ? `$${item.cpa.toFixed(2)}` : 'N/A'}</strong></span>
                  </div>
                </div>

                {/* Analyst Quick Decision Actions */}
                <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-navy-800 w-full lg:w-auto justify-end">
                  <button
                    disabled={actionInProgress === item.row_id}
                    onClick={() => handleQuickDecision(item.row_id, 'PROMOTE')}
                    className="px-3 py-1.5 text-xs font-bold text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 rounded-xl transition flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Promote</span>
                  </button>
                  <button
                    disabled={actionInProgress === item.row_id}
                    onClick={() => handleQuickDecision(item.row_id, 'BLOCK')}
                    className="px-3 py-1.5 text-xs font-bold text-rose-300 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 rounded-xl transition flex items-center gap-1.5"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Block</span>
                  </button>
                  <button
                    disabled={actionInProgress === item.row_id}
                    onClick={() => handleQuickDecision(item.row_id, 'IGNORE')}
                    className="px-3 py-1.5 text-xs font-bold text-slate-300 bg-slate-500/15 hover:bg-slate-500/25 border border-slate-500/30 rounded-xl transition flex items-center gap-1.5"
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Ignore</span>
                  </button>
                  <button
                    onClick={() => onSelectRecord(item)}
                    className="p-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-300 hover:text-white transition"
                    title="Open full evidence panel"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
