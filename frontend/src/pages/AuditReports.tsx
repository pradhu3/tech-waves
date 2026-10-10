import React from 'react';
import { DashboardSummary } from '../types';
import {
  FileCheck2,
  Download,
  ExternalLink,
  Printer,
  ShieldCheck,
  FileSpreadsheet,
  AlertTriangle,
  Layers,
  Database
} from 'lucide-react';

interface AuditReportsProps {
  summary: DashboardSummary | null;
  exportResultsUrl: string;
  exportNegativesUrl: string;
  exportRejectedUrl: string;
  auditHtmlUrl: string;
}

export const AuditReports: React.FC<AuditReportsProps> = ({
  summary,
  exportResultsUrl,
  exportNegativesUrl,
  exportRejectedUrl,
  auditHtmlUrl
}) => {
  if (!summary) return null;

  return (
    <div className="space-y-6">

      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border-sky-500/20 bg-gradient-to-r from-navy-900 via-navy-850 to-blue-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-sky-500/20 text-sky-400 uppercase tracking-wider flex items-center gap-1">
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Executive Compliance &amp; Audit</span>
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight m-0">
            Audit Reports &amp; Comprehensive Governance Exports
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl m-0 leading-relaxed">
            Generate auditor-grade documentation for search term classifications, negative keyword exports, data quality exceptions, and executive printouts.
          </p>
        </div>

        <a
          href={auditHtmlUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 rounded-xl shadow-lg shadow-sky-500/20 transition"
        >
          <Printer className="w-4 h-4" />
          <span>Open Printable Executive Report</span>
        </a>
      </div>

      {/* Download Center Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* 1. Full Results CSV */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between space-y-4">
          <div>
            <div className="p-3 rounded-xl bg-sky-500/10 text-sky-400 w-fit mb-3">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">
              Complete Triage Results CSV
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Full dataset of {summary.total_processed.toLocaleString()} records containing every decision, confidence metric, evidence signals, and formula injection protection.
            </p>
          </div>
          <a
            href={exportResultsUrl}
            download="search_term_triage_results.csv"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-slate-200 bg-navy-900 hover:bg-navy-800 border border-navy-700 rounded-xl transition"
          >
            <Download className="w-4 h-4 text-sky-400" />
            <span>Download Full Results CSV</span>
          </a>
        </div>

        {/* 2. Negative Keywords CSV */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between space-y-4">
          <div>
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 w-fit mb-3">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">
              Google Ads Editor Negatives CSV
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Export formatted specifically for Google Ads Editor bulk upload (Campaign, Ad Group, Keyword, Criterion Type) for immediate account sync.
            </p>
          </div>
          <a
            href={exportNegativesUrl}
            download="google_ads_negative_keywords.csv"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-slate-200 bg-navy-900 hover:bg-navy-800 border border-navy-700 rounded-xl transition"
          >
            <Download className="w-4 h-4 text-rose-400" />
            <span>Download Negatives CSV</span>
          </a>
        </div>

        {/* 3. Rejected Rows Audit */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between space-y-4">
          <div>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 w-fit mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">
              Rejected Rows Audit Log
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Download list of {summary.total_rejected} rejected records with original line numbers, raw values, and specific malformed data flags.
            </p>
          </div>
          <a
            href={exportRejectedUrl}
            download="rejected_rows_audit_report.csv"
            className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl border transition ${
              summary.total_rejected > 0
                ? 'text-slate-200 bg-navy-900 hover:bg-navy-800 border-navy-700'
                : 'text-slate-500 bg-navy-950/40 border-navy-800 pointer-events-none'
            }`}
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Download Rejections ({summary.total_rejected})</span>
          </a>
        </div>

      </div>

      {/* Historical Sessions Audit Trail */}
      <div className="glass-panel p-6 rounded-2xl">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <Database className="w-4 h-4 text-sky-400" />
          <span>Historical Analysis Sessions Ledger</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-navy-700/80 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="py-2.5 px-3">Session ID</th>
                <th className="py-2.5 px-3">Dataset Name</th>
                <th className="py-2.5 px-3 text-right">Processed Rows</th>
                <th className="py-2.5 px-3 text-right">Promote</th>
                <th className="py-2.5 px-3 text-right">Block</th>
                <th className="py-2.5 px-3 text-right">Review</th>
                <th className="py-2.5 px-3 text-right">Spend</th>
                <th className="py-2.5 px-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60">
              {summary.recent_audit_logs.map((log) => (
                <tr key={log.id} className="hover:bg-navy-850/50">
                  <td className="py-2.5 px-3 font-mono text-slate-500">{log.session_id.substring(0, 8)}...</td>
                  <td className="py-2.5 px-3 font-semibold text-white">{log.dataset_name}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-300">{log.row_count}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-emerald-400">{log.promote_count}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-rose-400">{log.block_count}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-amber-400">{log.review_count}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-white font-bold">${log.total_spend.toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">{log.created_at.substring(0, 16)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
