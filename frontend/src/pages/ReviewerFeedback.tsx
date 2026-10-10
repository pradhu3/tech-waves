import React, { useState, useEffect } from 'react';
import { ReviewFeedback } from '../types';
import { DecisionBadge } from '../components/DecisionBadge';
import { api } from '../services/api';
import {
  MessageSquareCheck,
  Trash2,
  Download,
  RefreshCw,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export const ReviewerFeedbackView: React.FC = () => {
  const [feedbackList, setFeedbackList] = useState<ReviewFeedback[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchFeedback = async () => {
    setIsLoading(true);
    try {
      const data = await api.getFeedback();
      setFeedbackList(data.feedback || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await api.deleteFeedback(id);
      await fetchFeedback();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all reviewer override feedback from SQLite?')) return;
    try {
      await api.clearFeedback();
      await fetchFeedback();
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportJson = () => {
    const jsonStr = JSON.stringify(feedbackList, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reviewer_feedback_dataset.json';
    a.click();
  };

  return (
    <div className="space-y-6">

      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border-sky-500/20 bg-gradient-to-r from-navy-900 via-navy-850 to-indigo-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-sky-500/20 text-sky-400 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SQLite Persistent Feedback Loop</span>
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight m-0">
            Reviewer Corrections &amp; Human Learning History ({feedbackList.length})
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl m-0 leading-relaxed">
            Every human override is permanently recorded with timestamps, original model outputs, and analyst justification notes. These preferences are leveraged on subsequent re-runs without universal overfitting.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportJson}
            disabled={feedbackList.length === 0}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-navy-900 hover:bg-navy-800 border border-navy-700 rounded-xl transition disabled:opacity-40"
          >
            <Download className="w-4 h-4 text-sky-400" />
            <span>Export Feedback Dataset</span>
          </button>
          <button
            onClick={handleClearAll}
            disabled={feedbackList.length === 0}
            className="px-3.5 py-2 text-xs font-semibold text-rose-300 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 rounded-xl transition disabled:opacity-40"
          >
            Reset Memory
          </button>
        </div>
      </div>

      {/* Feedback List */}
      <div className="glass-panel rounded-2xl overflow-hidden border-navy-700/80">
        <div className="p-5 border-b border-navy-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider m-0">
            Auditable Corrections Ledger
          </h3>
          <button
            onClick={fetchFeedback}
            className="p-1.5 rounded-lg bg-navy-800 text-slate-400 hover:text-white transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-navy-700/80 bg-navy-900/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider select-none">
                <th className="py-3 px-3">Search Term</th>
                <th className="py-3 px-3">Campaign / Ad Group</th>
                <th className="py-3 px-3 text-center">Engine Initial</th>
                <th className="py-3 px-3 text-center">Analyst Override</th>
                <th className="py-3 px-3">Reason / Justification</th>
                <th className="py-3 px-3">Logged At</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-sky-400" />
                    <span>Loading SQLite feedback entries...</span>
                  </td>
                </tr>
              ) : feedbackList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-semibold text-slate-300">No analyst overrides recorded yet</p>
                    <p className="text-xs text-slate-500 mt-1">Review any query in the analysis table or review queue to record corrections.</p>
                  </td>
                </tr>
              ) : (
                feedbackList.map((fb) => (
                  <tr key={fb.id} className="hover:bg-navy-850/60 transition">
                    <td className="py-3 px-3 font-semibold text-white max-w-xs truncate" title={fb.search_term}>
                      "{fb.search_term}"
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      <span className="block truncate">{fb.campaign}</span>
                      <span className="text-[10px] text-slate-500 block truncate">{fb.ad_group}</span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <DecisionBadge decision={fb.original_decision} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-center">
                      <DecisionBadge decision={fb.reviewer_decision} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-slate-300 max-w-xs truncate" title={fb.reason}>
                      <span>{fb.reason || 'Manual analyst triage'}</span>
                      {fb.notes && (
                        <span className="block text-[10px] text-slate-500 truncate">{fb.notes}</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {fb.timestamp ? fb.timestamp.replace('T', ' ').substring(0, 16) : '-'}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        disabled={deletingId === fb.id}
                        onClick={() => handleDelete(fb.id)}
                        className="p-1.5 rounded-lg bg-navy-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
                        title="Delete feedback entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
