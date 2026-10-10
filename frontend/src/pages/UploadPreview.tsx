import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertOctagon, 
  Download, 
  Sparkles, 
  ArrowRight,
  Database,
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';
import { api } from '../services/api';

interface UploadPreviewProps {
  onUploadSuccess: (uploadData: any) => void;
  sampleCsvUrl: string;
  rejectedCsvUrl: string;
  currentDatasetName: string;
  isDemo: boolean;
  totalRows: number;
  rejectedCount: number;
}

export const UploadPreview: React.FC<UploadPreviewProps> = ({
  onUploadSuccess,
  sampleCsvUrl,
  rejectedCsvUrl,
  currentDatasetName,
  isDemo,
  totalRows,
  rejectedCount
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedPreview, setUploadedPreview] = useState<any[] | null>(null);
  const [uploadStats, setUploadStats] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setUploadError('Invalid file type: Please upload a standard CSV file (.csv).');
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    try {
      const res = await api.uploadCSV(file);
      setUploadStats(res);
      setUploadedPreview(res.preview || []);
      onUploadSuccess(res);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to process CSV file.');
    } finally {
      setIsUploading(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleLoadDemo = async () => {
    setIsUploading(true);
    setUploadError(null);
    try {
      const res = await api.loadDemoData();
      onUploadSuccess(res);
      setUploadStats(null);
      setUploadedPreview(null);
    } catch (err: any) {
      setUploadError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight m-0">
            CSV Ingestion &amp; Data Validation
          </h2>
          <p className="text-xs text-slate-400 mt-1 m-0">
            Upload raw search query exports from Google Ads. Handles 25,000+ rows, maps schema variations, and tracks malformed rows safely.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={sampleCsvUrl}
            download="sample_search_terms_template.csv"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-navy-900 hover:bg-navy-800 border border-navy-700 rounded-xl transition"
          >
            <Download className="w-4 h-4 text-sky-400" />
            <span>Download CSV Template</span>
          </a>
          <button
            onClick={handleLoadDemo}
            disabled={isUploading}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 rounded-xl transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>Load Demo Dataset</span>
          </button>
        </div>
      </div>

      {/* Upload Drop Zone */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`glass-panel border-2 border-dashed p-10 rounded-2xl text-center cursor-pointer transition-all duration-200 ${
          isDragging 
            ? 'border-sky-400 bg-sky-500/10 scale-[1.005]' 
            : 'border-navy-700 hover:border-sky-500/50 hover:bg-navy-900/40'
        }`}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          accept=".csv" 
          className="hidden" 
          onChange={onFileChange}
        />
        
        <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-sky-500/10">
          {isUploading ? (
            <RefreshCw className="w-8 h-8 animate-spin" />
          ) : (
            <UploadCloud className="w-8 h-8" />
          )}
        </div>

        <h3 className="text-base font-bold text-white mb-1">
          {isUploading ? 'Validating and Processing CSV...' : 'Click to Upload or Drag & Drop Search Terms CSV'}
        </h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
          Accepts standard Google Ads Search Query exports. File size limit up to 64MB (25k+ records).
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-500">
          <span className="px-2 py-0.5 rounded bg-navy-800">Search Term / Query</span>
          <span className="px-2 py-0.5 rounded bg-navy-800">Match Type</span>
          <span className="px-2 py-0.5 rounded bg-navy-800">Campaign &amp; Ad Group</span>
          <span className="px-2 py-0.5 rounded bg-navy-800">Clicks, Cost &amp; Conversions</span>
        </div>
      </div>

      {/* Error Banner */}
      {uploadError && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-3">
          <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold mb-0.5">CSV Validation Error:</strong>
            <p className="m-0 leading-relaxed">{uploadError}</p>
          </div>
        </div>
      )}

      {/* Data Quality & Schema Mapping Summary Card */}
      <div className="glass-panel p-6 rounded-2xl">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <Database className="w-4 h-4 text-sky-400" />
          <span>Active Dataset Information &amp; Data Health</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-xl bg-navy-900/60 border border-navy-800">
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Dataset Name</span>
            <p className="text-sm font-bold text-white mt-1 mb-0 truncate" title={currentDatasetName}>
              {currentDatasetName}
            </p>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              {isDemo ? 'Synthetic Demo Sample' : 'User Uploaded File'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-navy-900/60 border border-navy-800">
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Valid Processed Rows</span>
            <p className="text-sm font-bold text-emerald-400 mt-1 mb-0">
              {totalRows.toLocaleString()} rows
            </p>
            <span className="text-[10px] text-emerald-500 block mt-0.5">
              100% Schema Mapped
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-navy-900/60 border border-navy-800">
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Rejected / Malformed</span>
            <p className="text-sm font-bold text-amber-400 mt-1 mb-0">
              {rejectedCount} rows
            </p>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Empty queries / Bad syntax
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-navy-900/60 border border-navy-800 flex flex-col justify-between">
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Rejected Rows Report</span>
            <a
              href={rejectedCsvUrl}
              download="rejected_rows_audit_report.csv"
              className={`mt-1.5 inline-flex items-center gap-1.5 text-xs font-semibold ${
                rejectedCount > 0 
                  ? 'text-sky-400 hover:text-sky-300 underline' 
                  : 'text-slate-500 pointer-events-none'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Report ({rejectedCount})</span>
            </a>
          </div>
        </div>
      </div>

      {/* Preview Table of Uploaded / Active Data */}
      {uploadedPreview && uploadedPreview.length > 0 && (
        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider m-0">
                Uploaded Records Sample Preview (First 10 Rows)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 m-0">
                Verify recognized columns and mapped metrics before detailed triage
              </p>
            </div>
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Ready for Analysis</span>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-navy-700/80 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Row</th>
                  <th className="py-2.5 px-3">Search Term</th>
                  <th className="py-2.5 px-3">Campaign</th>
                  <th className="py-2.5 px-3">Ad Group</th>
                  <th className="py-2.5 px-3 text-right">Clicks</th>
                  <th className="py-2.5 px-3 text-right">Cost</th>
                  <th className="py-2.5 px-3 text-right">Conversions</th>
                  <th className="py-2.5 px-3 text-center">Initial Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800/60">
                {uploadedPreview.map((item, idx) => (
                  <tr key={idx} className="hover:bg-navy-850/50">
                    <td className="py-2.5 px-3 font-mono text-slate-500">{item.row_id}</td>
                    <td className="py-2.5 px-3 font-semibold text-white truncate max-w-xs">{item.search_term}</td>
                    <td className="py-2.5 px-3 text-slate-300">{item.campaign}</td>
                    <td className="py-2.5 px-3 text-slate-400">{item.ad_group}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-300">{item.clicks ?? '-'}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-rose-400 font-bold">${item.cost ? item.cost.toFixed(2) : '0.00'}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-400 font-bold">{item.conversions ?? '-'}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-navy-800 border border-navy-700 text-slate-200">
                        {item.recommendation}
                      </span>
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
};
