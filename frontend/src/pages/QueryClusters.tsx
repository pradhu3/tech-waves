import React, { useState, useEffect } from 'react';
import { QueryCluster, ClusterItem, Decision } from '../types';
import { DecisionBadge } from '../components/DecisionBadge';
import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { api } from '../services/api';
import {
  Layers,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  DollarSign,
  TrendingUp,
  RefreshCw,
  Eye,
  CheckCircle2,
  Ban,
  ArrowRight
} from 'lucide-react';

interface QueryClustersProps {
  onSelectRecordById: (rowId: string) => void;
  onRefreshSummary: () => void;
}

export const QueryClusters: React.FC<QueryClustersProps> = ({
  onSelectRecordById,
  onRefreshSummary
}) => {
  const [clusters, setClusters] = useState<QueryCluster[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedClusters, setExpandedClusters] = useState<string[]>([]);
  const [conflictOnly, setConflictOnly] = useState(false);
  const [batchingClusterId, setBatchingClusterId] = useState<string | null>(null);

  const fetchClusters = async () => {
    setIsLoading(true);
    try {
      const data = await api.getClusters();
      setClusters(data.clusters || []);
      // Expand top 2 clusters by default
      if (data.clusters && data.clusters.length > 0) {
        setExpandedClusters([data.clusters[0].cluster_id, data.clusters[1]?.cluster_id].filter(Boolean) as string[]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClusters();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedClusters(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleBatchTriage = async (cluster: QueryCluster, decision: Decision) => {
    setBatchingClusterId(cluster.cluster_id);
    try {
      for (const term of cluster.terms) {
        await api.submitReview(term.row_id, decision, `Batch triage from cluster '${cluster.cluster_name}'`, 'Query cluster batch override');
      }
      await fetchClusters();
      onRefreshSummary();
    } catch (err) {
      console.error(err);
    } finally {
      setBatchingClusterId(null);
    }
  };

  const displayedClusters = conflictOnly 
    ? clusters.filter(c => c.has_conflicts) 
    : clusters;

  return (
    <div className="space-y-6">

      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border-sky-500/20 bg-gradient-to-r from-navy-900 via-navy-850 to-indigo-950/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-500/20 text-indigo-400 uppercase tracking-wider flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              <span>Token-Overlap Similarity Engine</span>
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight m-0">
            Similar Search-Term Clusters ({clusters.length} Groups)
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl m-0 leading-relaxed">
            Identifies syntactic near-duplicates and phrase permutations (Jaccard token similarity &ge; 0.60). Uncovers recommendation conflicts across campaigns before bulk action.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300 select-none bg-navy-900/60 px-3 py-2 rounded-xl border border-navy-800">
            <input
              type="checkbox"
              checked={conflictOnly}
              onChange={(e) => setConflictOnly(e.target.checked)}
              className="rounded border-navy-700 bg-navy-950 text-amber-500"
            />
            <span className="flex items-center gap-1 text-amber-300">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Conflicting Clusters Only</span>
            </span>
          </label>
          <button
            onClick={fetchClusters}
            className="p-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-300 transition"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Clusters List */}
      {isLoading ? (
        <div className="glass-panel p-12 text-center text-slate-400 rounded-2xl">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-sky-400" />
          <span>Clustering queries via token overlap algorithms...</span>
        </div>
      ) : displayedClusters.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl">
          <p className="text-sm font-semibold text-slate-300">No clusters match current filter</p>
          <p className="text-xs text-slate-500 mt-1">Try unchecking 'Conflicting Clusters Only' to view all groups.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedClusters.map((cluster) => {
            const isExpanded = expandedClusters.includes(cluster.cluster_id);
            return (
              <div 
                key={cluster.cluster_id}
                className={`glass-panel rounded-2xl overflow-hidden border transition-all ${
                  cluster.has_conflicts 
                    ? 'border-amber-500/40 bg-gradient-to-r from-navy-900 to-amber-950/10' 
                    : 'border-navy-700/80'
                }`}
              >
                {/* Cluster Header Bar */}
                <div 
                  onClick={() => toggleExpand(cluster.cluster_id)}
                  className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer hover:bg-navy-850/40 transition select-none"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-mono text-slate-400 bg-navy-800 px-2 py-0.5 rounded">
                        {cluster.cluster_id} • {cluster.terms_count} terms
                      </span>
                      {cluster.has_conflicts && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Recommendation Conflict Detected</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-white tracking-tight m-0 truncate" title={cluster.cluster_name}>
                      Group: "{cluster.cluster_name}"
                    </h3>

                    {cluster.conflict_summary && (
                      <p className="text-xs text-amber-300/90 mt-1 m-0">
                        {cluster.conflict_summary}
                      </p>
                    )}
                  </div>

                  {/* Summary Totals & Expand Button */}
                  <div className="flex items-center gap-6 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">Total Spend</span>
                      <strong className="text-sm font-mono text-rose-400 font-bold">
                        ${cluster.total_spend.toFixed(2)}
                      </strong>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">Conversions</span>
                      <strong className="text-sm font-mono text-emerald-400 font-bold">
                        {cluster.total_conversions}
                      </strong>
                    </div>

                    <div className="flex items-center gap-1">
                      {Object.entries(cluster.decision_breakdown).map(([dec, count]) => (
                        <span key={dec} className="text-[10px] px-2 py-0.5 rounded bg-navy-800 text-slate-300 font-bold">
                          {dec}: {count}
                        </span>
                      ))}
                    </div>

                    <div className="p-1 rounded-lg bg-navy-800 text-slate-400">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Member Terms Table */}
                {isExpanded && (
                  <div className="border-t border-navy-800 p-5 bg-navy-950/60 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Member Queries in this Cluster
                      </span>
                      
                      {/* Batch Triage Actions */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 mr-1">Batch apply:</span>
                        <button
                          disabled={batchingClusterId === cluster.cluster_id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBatchTriage(cluster, 'PROMOTE');
                          }}
                          className="px-2.5 py-1 text-xs font-bold text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 rounded-lg transition"
                        >
                          Promote Group
                        </button>
                        <button
                          disabled={batchingClusterId === cluster.cluster_id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBatchTriage(cluster, 'BLOCK');
                          }}
                          className="px-2.5 py-1 text-xs font-bold text-rose-300 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 rounded-lg transition"
                        >
                          Block Group
                        </button>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-navy-800 text-slate-400 font-semibold uppercase text-[10px]">
                            <th className="py-2.5 px-3">Search Query</th>
                            <th className="py-2.5 px-3">Campaign / Ad Group</th>
                            <th className="py-2.5 px-3 text-right">Clicks</th>
                            <th className="py-2.5 px-3 text-right">Spend</th>
                            <th className="py-2.5 px-3 text-right">Conv.</th>
                            <th className="py-2.5 px-3 text-center">Decision</th>
                            <th className="py-2.5 px-3 text-center">Confidence</th>
                            <th className="py-2.5 px-3 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-navy-800/40">
                          {cluster.terms.map((term) => (
                            <tr key={term.row_id} className="hover:bg-navy-900/60 transition">
                              <td className="py-2.5 px-3 font-semibold text-white max-w-xs truncate">
                                "{term.search_term}"
                              </td>
                              <td className="py-2.5 px-3 text-slate-400">
                                <span className="text-slate-300">{term.campaign}</span>
                                <span className="text-slate-500 text-[10px] block">{term.ad_group}</span>
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                                {term.clicks ?? '-'}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono text-rose-400 font-bold">
                                ${term.cost ? term.cost.toFixed(2) : '0.00'}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono text-emerald-400 font-bold">
                                {term.conversions ?? '-'}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <DecisionBadge decision={term.recommendation} size="sm" />
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <ConfidenceBadge score={term.confidence} />
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <button
                                  onClick={() => onSelectRecordById(term.row_id)}
                                  className="p-1 rounded bg-navy-800 hover:bg-sky-500/20 text-slate-400 hover:text-sky-300 transition"
                                  title="View evidence in drawer"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
