import React, { useState } from 'react';
import { SearchTermRecord, Decision } from '../types';
import { DecisionBadge } from './DecisionBadge';
import { ConfidenceBadge } from './ConfidenceBadge';
import { 
  X, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  HelpCircle, 
  ArrowRight, 
  Layers, 
  DollarSign, 
  Target, 
  ShieldCheck, 
  Send
} from 'lucide-react';

interface DetailDrawerProps {
  record: SearchTermRecord | null;
  onClose: () => void;
  onSubmitReview?: (row_id: string, decision: Decision, reason: string, notes: string) => Promise<void>;
}

export const DetailDrawer: React.FC<DetailDrawerProps> = ({
  record,
  onClose,
  onSubmitReview
}) => {
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null);
  const [reasonText, setReasonText] = useState('');
  const [notesText, setNotesText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  if (!record) return null;

  const currentDecision = selectedDecision || record.recommendation;

  const handleReview = async () => {
    if (!onSubmitReview) return;
    setIsSubmitting(true);
    try {
      await onSubmitReview(
        record.row_id,
        currentDecision,
        reasonText || 'Manual analyst triage in decision panel',
        notesText
      );
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end transition-opacity">
      <div className="w-full max-w-2xl bg-navy-950 border-l border-navy-700/80 shadow-2xl flex flex-col h-full overflow-hidden animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-navy-800 bg-navy-900/50 flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 bg-navy-800 px-2 py-0.5 rounded">
                {record.row_id} • {record.match_type} Match
              </span>
              <span className="text-[11px] text-slate-400">
                {record.campaign} &gt; {record.ad_group}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight break-words m-0">
              "{record.search_term}"
            </h2>
            <div className="flex items-center gap-3 mt-3">
              <DecisionBadge decision={record.recommendation} size="md" />
              <ConfidenceBadge score={record.confidence} label={record.confidence_label} showBar />
              {record.review_status && (
                <span className="text-xs text-slate-400 font-medium">
                  Status: <strong className="text-slate-200">{record.review_status}</strong>
                </span>
              )}
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-navy-800/60 hover:bg-navy-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Explanation Banner */}
          <div className="p-4 rounded-xl bg-sky-950/40 border border-sky-500/30 text-sky-100 text-sm leading-relaxed">
            <div className="flex items-center gap-2 font-semibold text-sky-300 mb-1">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              <span>Evidence-Based Reasoning</span>
            </div>
            <p className="m-0 text-slate-200">{record.explanation}</p>
          </div>

          {/* Key Metrics Grid */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Recorded &amp; Calculated Metrics
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
              <div className="p-3 rounded-xl bg-navy-900/60 border border-navy-800 text-center">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Impressions</span>
                <p className="text-base font-bold text-white mt-0.5 mb-0">
                  {record.impressions !== null && record.impressions !== undefined ? record.impressions.toLocaleString() : 'N/A'}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-navy-900/60 border border-navy-800 text-center">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Clicks</span>
                <p className="text-base font-bold text-white mt-0.5 mb-0">
                  {record.clicks !== null && record.clicks !== undefined ? record.clicks : 'N/A'}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-navy-900/60 border border-navy-800 text-center">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Cost</span>
                <p className="text-base font-bold text-rose-400 mt-0.5 mb-0">
                  {record.cost !== null && record.cost !== undefined ? `$${record.cost.toFixed(2)}` : 'N/A'}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-navy-900/60 border border-navy-800 text-center">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Conversions</span>
                <p className="text-base font-bold text-emerald-400 mt-0.5 mb-0">
                  {record.conversions !== null && record.conversions !== undefined ? record.conversions : 'N/A'}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-navy-900/60 border border-navy-800 text-center">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Conv. Value</span>
                <p className="text-base font-bold text-sky-400 mt-0.5 mb-0">
                  {record.conversion_value !== null && record.conversion_value !== undefined ? `$${record.conversion_value.toFixed(2)}` : 'N/A'}
                </p>
              </div>
            </div>

            {/* Derived Ratios */}
            <div className="grid grid-cols-4 gap-2.5 mt-2.5">
              <div className="p-2.5 rounded-xl bg-navy-900/40 border border-navy-800/80 text-xs">
                <span className="text-slate-400">CTR:</span>
                <strong className="text-slate-200 ml-1.5">{record.ctr !== null && record.ctr !== undefined ? `${record.ctr}%` : 'N/A'}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-navy-900/40 border border-navy-800/80 text-xs">
                <span className="text-slate-400">CPC:</span>
                <strong className="text-slate-200 ml-1.5">{record.cpc !== null && record.cpc !== undefined ? `$${record.cpc.toFixed(2)}` : 'N/A'}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-navy-900/40 border border-navy-800/80 text-xs">
                <span className="text-slate-400">CPA:</span>
                <strong className="text-slate-200 ml-1.5">{record.cpa !== null && record.cpa !== undefined ? `$${record.cpa.toFixed(2)}` : 'N/A'}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-navy-900/40 border border-navy-800/80 text-xs">
                <span className="text-slate-400">ROAS:</span>
                <strong className="text-slate-200 ml-1.5">{record.roas !== null && record.roas !== undefined ? `${record.roas.toFixed(2)}x` : 'N/A'}</strong>
              </div>
            </div>
          </div>

          {/* Evidence Breakdown: Positive, Negative, Missing, Uncertainty */}
          <div className="space-y-4">
            {/* Positive Evidence */}
            {record.positive_evidence && record.positive_evidence.length > 0 && (
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Supporting Positive Signals</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300 pl-4 list-disc">
                  {record.positive_evidence.map((ev, i) => (
                    <li key={i}>{ev}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Negative Evidence */}
            {record.negative_evidence && record.negative_evidence.length > 0 && (
              <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/20">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider mb-2">
                  <XCircle className="w-4 h-4" />
                  <span>Warning / Negative Signals</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300 pl-4 list-disc">
                  {record.negative_evidence.map((ev, i) => (
                    <li key={i}>{ev}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Uncertainty & Missing Data Factors */}
            {(record.uncertainty_factors.length > 0 || record.missing_data.length > 0) && (
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Uncertainty &amp; Data Completeness Checks</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300 pl-4 list-disc">
                  {record.missing_data.map((m, i) => (
                    <li key={`m-${i}`} className="text-amber-300 font-medium">{m}</li>
                  ))}
                  {record.uncertainty_factors.map((u, i) => (
                    <li key={`u-${i}`}>{u}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Triggered Rules */}
            <div className="p-4 rounded-xl bg-navy-900/60 border border-navy-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Classification Rules Triggered
              </span>
              <div className="flex flex-wrap gap-1.5">
                {record.rules_triggered.map((rule, idx) => (
                  <span key={idx} className="px-2.5 py-1 text-[11px] font-mono rounded-lg bg-navy-800 border border-navy-700 text-sky-300">
                    {rule}
                  </span>
                ))}
              </div>
            </div>

            {/* Recommended Action */}
            <div className="p-4 rounded-xl bg-navy-900 border border-sky-500/30 flex items-start gap-3">
              <Target className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider block mb-1">
                  Recommended Action
                </span>
                <p className="text-sm font-medium text-slate-200 m-0">
                  {record.recommended_next_action}
                </p>
                {record.suggested_negative && record.recommendation === 'BLOCK' && (
                  <div className="mt-2 text-xs bg-navy-950 px-3 py-2 rounded-lg border border-navy-800 text-slate-300">
                    Suggested Negative: <code className="text-rose-400 font-bold">{record.suggested_negative}</code> ({record.suggested_match_type || 'Exact'} match @ {record.suggested_scope || 'Campaign'} level)
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Analyst Review & Overrides Section */}
          <div className="p-5 rounded-2xl bg-navy-900/80 border border-navy-700/80 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Send className="w-4 h-4 text-sky-400" />
              <span>Analyst Override &amp; Review Action</span>
            </h3>

            <div>
              <label className="text-xs font-medium text-slate-400 block mb-2">
                Override Recommendation Decision
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['PROMOTE', 'BLOCK', 'IGNORE', 'HUMAN REVIEW'] as Decision[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setSelectedDecision(d)}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                      currentDecision === d
                        ? 'bg-sky-500 text-white border-sky-400 shadow-md shadow-sky-500/25 scale-[1.02]'
                        : 'bg-navy-950/60 text-slate-400 border-navy-800 hover:bg-navy-800 hover:text-white'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1.5">
                Reason for Decision / Correction
              </label>
              <input
                type="text"
                value={reasonText}
                onChange={(e) => setReasonText(e.target.value)}
                placeholder="e.g. Verified offline conversion; non-commercial intent pattern..."
                className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1.5">
                Internal Analyst Notes (Stored in SQLite audit log)
              </label>
              <textarea
                rows={2}
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                placeholder="Optional detailed context or campaign goal references..."
                className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleReview}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 shadow-lg shadow-sky-500/20 transition active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving Review...' : submitSuccess ? 'Saved!' : 'Submit Review Override'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
