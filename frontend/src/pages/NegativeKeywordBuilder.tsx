import React, { useState, useEffect } from 'react';
import { NegativeKeyword } from '../types';
import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { api } from '../services/api';
import {
  Ban,
  Download,
  CheckCircle2,
  XCircle,
  Edit2,
  Save,
  RefreshCw,
  Sliders,
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react';

interface NegativeKeywordBuilderProps {
  exportNegativesUrl: string;
}

export const NegativeKeywordBuilder: React.FC<NegativeKeywordBuilderProps> = ({
  exportNegativesUrl
}) => {
  const [negatives, setNegatives] = useState<NegativeKeyword[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<{
    suggested_negative: string;
    match_type: 'Exact' | 'Phrase' | 'Broad';
    scope: 'Campaign' | 'Ad Group';
  }>({
    suggested_negative: '',
    match_type: 'Exact',
    scope: 'Campaign'
  });

  const fetchNegatives = async () => {
    setIsLoading(true);
    try {
      const data = await api.getNegativeKeywords();
      setNegatives(data.negative_keywords || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNegatives();
  }, []);

  const handleStartEdit = (item: NegativeKeyword) => {
    setEditingId(item.id);
    setEditValues({
      suggested_negative: item.suggested_negative || item.search_term,
      match_type: item.match_type,
      scope: item.scope
    });
  };

  const handleSaveEdit = async (id: number) => {
    try {
      await api.updateNegativeKeyword(id, editValues);
      setEditingId(null);
      await fetchNegatives();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSetStatus = async (id: number, status: 'Approved' | 'Rejected') => {
    try {
      await api.updateNegativeKeyword(id, { status });
      await fetchNegatives();
    } catch (err) {
      console.error(err);
    }
  };

  const approvedCount = negatives.filter(n => n.status === 'Approved').length;
  const pendingCount = negatives.filter(n => n.status === 'Pending').length;

  return (
    <div className="space-y-6">

      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border-rose-500/30 bg-gradient-to-r from-navy-900 via-navy-850 to-rose-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-rose-500/20 text-rose-400 uppercase tracking-wider flex items-center gap-1">
              <Ban className="w-3.5 h-3.5" />
              <span>Negative Keyword Governance</span>
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight m-0">
            Negative Keyword Builder &amp; Exporter
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl m-0 leading-relaxed">
            Review proposed negative keywords generated from BLOCK recommendations. Customize scope, edit match types, and export clean CSV formatted for Google Ads Editor.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={exportNegativesUrl}
            download="google_ads_negative_keywords.csv"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 rounded-xl shadow-lg shadow-rose-500/20 transition active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Export for Google Ads Editor</span>
          </a>
          <button
            onClick={fetchNegatives}
            className="p-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-300 transition"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-navy-900/60 border border-navy-800">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Proposed Negatives</span>
          <p className="text-xl font-bold text-white mt-1 mb-0">{negatives.length}</p>
        </div>
        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
          <span className="text-[10px] uppercase font-bold text-emerald-400">Approved for Export</span>
          <p className="text-xl font-bold text-emerald-400 mt-1 mb-0">{approvedCount}</p>
        </div>
        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20">
          <span className="text-[10px] uppercase font-bold text-amber-400">Pending Analyst Sign-Off</span>
          <p className="text-xl font-bold text-amber-400 mt-1 mb-0">{pendingCount}</p>
        </div>
      </div>

      {/* Negatives Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border-navy-700/80">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-navy-700/80 bg-navy-900/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider select-none">
                <th className="py-3 px-3">Original Search Term</th>
                <th className="py-3 px-3">Suggested Negative Keyword</th>
                <th className="py-3 px-3">Campaign / Ad Group</th>
                <th className="py-3 px-3 text-center">Match Type</th>
                <th className="py-3 px-3 text-center">Scope</th>
                <th className="py-3 px-3 text-center">Confidence</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-rose-400" />
                    <span>Loading proposed negative keywords...</span>
                  </td>
                </tr>
              ) : negatives.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-semibold text-slate-300">No negative keywords currently generated</p>
                    <p className="text-xs text-slate-500 mt-1">Classify BLOCK terms in analysis or upload dataset.</p>
                  </td>
                </tr>
              ) : (
                negatives.map((item) => {
                  const isEditing = editingId === item.id;
                  return (
                    <tr key={item.id} className="hover:bg-navy-850/60 transition">
                      
                      {/* Search Term */}
                      <td className="py-3 px-3 font-semibold text-white max-w-xs truncate" title={item.search_term}>
                        "{item.search_term}"
                      </td>

                      {/* Suggested Keyword (Editable) */}
                      <td className="py-3 px-3 font-mono font-bold text-rose-400">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editValues.suggested_negative}
                            onChange={(e) => setEditValues({ ...editValues, suggested_negative: e.target.value })}
                            className="bg-navy-950 border border-sky-500 rounded px-2 py-1 text-xs text-white w-full focus:outline-none"
                          />
                        ) : (
                          <span>
                            {item.match_type === 'Exact' && `[${item.suggested_negative || item.search_term}]`}
                            {item.match_type === 'Phrase' && `"${item.suggested_negative || item.search_term}"`}
                            {item.match_type === 'Broad' && `${item.suggested_negative || item.search_term}`}
                          </span>
                        )}
                      </td>

                      {/* Campaign / Ad Group */}
                      <td className="py-3 px-3 text-slate-300 max-w-[180px] truncate">
                        <span className="font-medium text-slate-200 block truncate">{item.campaign}</span>
                        <span className="text-[10px] text-slate-400 block truncate">{item.ad_group}</span>
                      </td>

                      {/* Match Type (Editable) */}
                      <td className="py-3 px-3 text-center">
                        {isEditing ? (
                          <select
                            value={editValues.match_type}
                            onChange={(e) => setEditValues({ ...editValues, match_type: e.target.value as any })}
                            className="bg-navy-950 border border-sky-500 rounded px-1.5 py-1 text-[11px] text-white focus:outline-none"
                          >
                            <option value="Exact">Exact</option>
                            <option value="Phrase">Phrase</option>
                            <option value="Broad">Broad</option>
                          </select>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-navy-800 text-slate-300">
                            {item.match_type}
                          </span>
                        )}
                      </td>

                      {/* Scope (Editable) */}
                      <td className="py-3 px-3 text-center">
                        {isEditing ? (
                          <select
                            value={editValues.scope}
                            onChange={(e) => setEditValues({ ...editValues, scope: e.target.value as any })}
                            className="bg-navy-950 border border-sky-500 rounded px-1.5 py-1 text-[11px] text-white focus:outline-none"
                          >
                            <option value="Campaign">Campaign</option>
                            <option value="Ad Group">Ad Group</option>
                          </select>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-navy-800 text-slate-300">
                            {item.scope}
                          </span>
                        )}
                      </td>

                      {/* Confidence */}
                      <td className="py-3 px-3 text-center">
                        <ConfidenceBadge score={item.confidence || 90} />
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          item.status === 'Approved'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : item.status === 'Rejected'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {item.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {isEditing ? (
                            <button
                              onClick={() => handleSaveEdit(item.id)}
                              className="p-1 rounded bg-sky-500 text-white hover:bg-sky-400 transition"
                              title="Save changes"
                            >
                              <Save className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStartEdit(item)}
                              className="p-1 rounded bg-navy-800 hover:bg-navy-700 text-slate-400 hover:text-white transition"
                              title="Edit negative keyword"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleSetStatus(item.id, 'Approved')}
                            className="p-1 rounded bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 transition"
                            title="Approve for export"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleSetStatus(item.id, 'Rejected')}
                            className="p-1 rounded bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 transition"
                            title="Reject"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
