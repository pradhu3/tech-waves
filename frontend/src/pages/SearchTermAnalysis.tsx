import React, { useState, useEffect } from 'react';
import { SearchTermRecord, Decision } from '../types';
import { DecisionBadge } from '../components/DecisionBadge';
import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { api } from '../services/api';
import {
  Search,
  Filter,
  ArrowUpDown,
  Download,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle,
  Ban,
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react';

interface SearchTermAnalysisProps {
  onSelectRecord: (record: SearchTermRecord) => void;
  exportResultsUrl: string;
}

export const SearchTermAnalysis: React.FC<SearchTermAnalysisProps> = ({
  onSelectRecord,
  exportResultsUrl
}) => {
  const [records, setRecords] = useState<SearchTermRecord[]>([]);
  const [campaigns, setCampaigns] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDecision, setSelectedDecision] = useState('ALL');
  const [selectedCampaign, setSelectedCampaign] = useState('ALL');
  const [selectedConfidence, setSelectedConfidence] = useState('ALL');
  const [humanReviewOnly, setHumanReviewOnly] = useState(false);
  const [minSpendFilter, setMinSpendFilter] = useState<number | undefined>(undefined);
  const [sortBy, setSortBy] = useState('cost');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Row selection for bulk actions
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [bulkActionConfirm, setBulkActionConfirm] = useState<Decision | null>(null);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      const data = await api.getResults({
        search: searchQuery,
        decision: selectedDecision,
        campaign: selectedCampaign,
        confidence: selectedConfidence,
        human_review_only: humanReviewOnly,
        min_spend: minSpendFilter,
        sort_by: sortBy,
        sort_dir: sortDir,
        page: currentPage,
        page_size: pageSize
      });
      setRecords(data.results || []);
      setTotalCount(data.total || 0);
      setTotalPages(data.total_pages || 1);
      if (data.campaigns) setCampaigns(data.campaigns);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [
    currentPage,
    selectedDecision,
    selectedCampaign,
    selectedConfidence,
    humanReviewOnly,
    sortBy,
    sortDir,
    minSpendFilter
  ]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchRecords();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleToggleSelectAll = () => {
    if (selectedRowIds.length === records.length) {
      setSelectedRowIds([]);
    } else {
      setSelectedRowIds(records.map(r => r.row_id));
    }
  };

  const handleToggleRow = (rowId: string) => {
    setSelectedRowIds(prev => 
      prev.includes(rowId) ? prev.filter(id => id !== rowId) : [...prev, rowId]
    );
  };

  const handleBulkAction = async (decision: Decision) => {
    setIsBulkProcessing(true);
    try {
      for (const rowId of selectedRowIds) {
        await api.submitReview(rowId, decision, `Bulk triage override to ${decision}`, 'Bulk applied action');
      }
      setSelectedRowIds([]);
      setBulkActionConfirm(null);
      await fetchRecords();
    } catch (err) {
      console.error(err);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDir('desc');
    }
  };

  return (
    <div className="space-y-4">

      {/* Header and Filter Controls */}
      <div className="glass-panel p-5 rounded-2xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight m-0">
              Search Term Analysis &amp; Triage
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 m-0">
              Interactive data table. Filter, search, inspect evidence, or override recommendations.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <a
              href={exportResultsUrl}
              download="search_term_triage_results.csv"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-navy-900 hover:bg-navy-800 border border-navy-700 rounded-xl transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span>Export CSV</span>
            </a>
            <button
              onClick={fetchRecords}
              className="p-2 rounded-xl bg-navy-900 hover:bg-navy-800 text-slate-400 hover:text-white border border-navy-700 transition"
              title="Refresh results"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5 pt-2 border-t border-navy-800">
          
          {/* Search Input */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search query text or ad group..."
              className="w-full bg-navy-950/80 border border-navy-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Decision Filter */}
          <div>
            <select
              value={selectedDecision}
              onChange={(e) => {
                setSelectedDecision(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-navy-950/80 border border-navy-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            >
              <option value="ALL">All Decisions</option>
              <option value="PROMOTE">PROMOTE</option>
              <option value="BLOCK">BLOCK</option>
              <option value="HUMAN REVIEW">HUMAN REVIEW</option>
              <option value="IGNORE">IGNORE</option>
            </select>
          </div>

          {/* Campaign Filter */}
          <div>
            <select
              value={selectedCampaign}
              onChange={(e) => {
                setSelectedCampaign(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-navy-950/80 border border-navy-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500 truncate"
            >
              <option value="ALL">All Campaigns</option>
              {campaigns.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Confidence Filter */}
          <div>
            <select
              value={selectedConfidence}
              onChange={(e) => {
                setSelectedConfidence(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-navy-950/80 border border-navy-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            >
              <option value="ALL">All Confidence</option>
              <option value="HIGH">High (&gt;=75%)</option>
              <option value="MEDIUM">Medium (50-74%)</option>
              <option value="LOW">Low (&lt;50%)</option>
            </select>
          </div>

          {/* Human Review Only Toggle */}
          <div className="flex items-center">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300 select-none">
              <input
                type="checkbox"
                checked={humanReviewOnly}
                onChange={(e) => {
                  setHumanReviewOnly(e.target.checked);
                  setCurrentPage(1);
                }}
                className="rounded border-navy-700 bg-navy-950 text-sky-500 focus:ring-0"
              />
              <span className="flex items-center gap-1 text-amber-300">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Review Only</span>
              </span>
            </label>
          </div>

        </div>

        {/* Bulk Actions Bar (Appears when rows selected) */}
        {selectedRowIds.length > 0 && (
          <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-500/40 flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
            <span className="text-xs font-bold text-sky-300">
              {selectedRowIds.length} queries selected for bulk triage
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={isBulkProcessing}
                onClick={() => handleBulkAction('PROMOTE')}
                className="px-2.5 py-1 text-xs font-bold text-emerald-300 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 rounded-lg transition"
              >
                Promote All
              </button>
              <button
                disabled={isBulkProcessing}
                onClick={() => handleBulkAction('BLOCK')}
                className="px-2.5 py-1 text-xs font-bold text-rose-300 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 rounded-lg transition"
              >
                Block All
              </button>
              <button
                disabled={isBulkProcessing}
                onClick={() => handleBulkAction('IGNORE')}
                className="px-2.5 py-1 text-xs font-bold text-slate-300 bg-slate-500/20 hover:bg-slate-500/30 border border-slate-500/40 rounded-lg transition"
              >
                Ignore All
              </button>
              <button
                onClick={() => setSelectedRowIds([])}
                className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Results Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border-navy-700/60">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-navy-700/80 bg-navy-900/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider select-none">
                <th className="py-3 px-3 w-8">
                  <input
                    type="checkbox"
                    checked={selectedRowIds.length > 0 && selectedRowIds.length === records.length}
                    onChange={handleToggleSelectAll}
                    className="rounded border-navy-700 bg-navy-950 text-sky-500"
                  />
                </th>
                <th 
                  className="py-3 px-3 cursor-pointer hover:text-white"
                  onClick={() => handleSort('search_term')}
                >
                  <div className="flex items-center gap-1">
                    <span>Search Term</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3">Campaign / Ad Group</th>
                <th className="py-3 px-3 text-center">Match</th>
                <th 
                  className="py-3 px-3 text-right cursor-pointer hover:text-white"
                  onClick={() => handleSort('clicks')}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Clicks</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  className="py-3 px-3 text-right cursor-pointer hover:text-white"
                  onClick={() => handleSort('cost')}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Cost</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  className="py-3 px-3 text-right cursor-pointer hover:text-white"
                  onClick={() => handleSort('conversions')}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Conv.</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 text-center">Decision</th>
                <th 
                  className="py-3 px-3 text-center cursor-pointer hover:text-white"
                  onClick={() => handleSort('confidence')}
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Confidence</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3">Explanation &amp; Action</th>
                <th className="py-3 px-3 text-center w-12">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-sky-400" />
                    <span>Loading search terms triage records...</span>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-semibold text-slate-300">No matching search terms found</p>
                    <p className="text-xs text-slate-500 mt-1">Adjust search filter or upload a CSV dataset</p>
                  </td>
                </tr>
              ) : (
                records.map((row) => (
                  <tr 
                    key={row.row_id}
                    onClick={() => onSelectRecord(row)}
                    className="hover:bg-navy-850/60 transition group cursor-pointer"
                  >
                    <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedRowIds.includes(row.row_id)}
                        onChange={() => handleToggleRow(row.row_id)}
                        className="rounded border-navy-700 bg-navy-950 text-sky-500"
                      />
                    </td>
                    <td className="py-3 px-3 font-semibold text-white max-w-xs truncate" title={row.search_term}>
                      "{row.search_term}"
                    </td>
                    <td className="py-3 px-3 text-slate-300 max-w-[180px] truncate">
                      <span className="font-medium text-slate-200 block truncate">{row.campaign}</span>
                      <span className="text-[10px] text-slate-400 block truncate">{row.ad_group}</span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-navy-800 text-slate-400">
                        {row.match_type}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-300">
                      {row.clicks !== null && row.clicks !== undefined ? row.clicks : '-'}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-rose-400">
                      ${row.cost !== null && row.cost !== undefined ? row.cost.toFixed(2) : '0.00'}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                      {row.conversions !== null && row.conversions !== undefined ? row.conversions : '-'}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <DecisionBadge decision={row.recommendation} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-center">
                      <ConfidenceBadge score={row.confidence} label={row.confidence_label} />
                    </td>
                    <td className="py-3 px-3 text-slate-400 max-w-xs truncate" title={row.explanation}>
                      <span className="line-clamp-1">{row.explanation}</span>
                    </td>
                    <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onSelectRecord(row)}
                        className="p-1.5 rounded-lg bg-navy-800 hover:bg-sky-500/20 text-slate-400 hover:text-sky-300 transition"
                        title="Open explainable decision panel"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-navy-800 bg-navy-900/40 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing <strong className="text-white">{records.length}</strong> of{' '}
            <strong className="text-white">{totalCount.toLocaleString()}</strong> results
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1 || isLoading}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="p-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-300 disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages || isLoading}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="p-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-300 disabled:opacity-40 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
