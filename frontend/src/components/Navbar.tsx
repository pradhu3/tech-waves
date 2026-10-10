import React from 'react';
import { 
  Sparkles, 
  UploadCloud, 
  FileText, 
  Sun, 
  Moon, 
  Activity, 
  Database,
  HelpCircle
} from 'lucide-react';

interface NavbarProps {
  datasetName: string;
  isDemo: boolean;
  totalRecords: number;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onNavigateToUpload: () => void;
  onNavigateToHelp: () => void;
  sampleCsvUrl: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  datasetName,
  isDemo,
  totalRecords,
  theme,
  onToggleTheme,
  onNavigateToUpload,
  onNavigateToHelp,
  sampleCsvUrl
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-navy-700/60 bg-navy-950/80 backdrop-blur-md px-6 py-3.5 transition-colors">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Branding & Subtitle */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-sky-500/20 border border-sky-400/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold tracking-tight text-white m-0">
                Search Term Triage Engine
              </h1>
              <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold tracking-wider rounded bg-sky-500/20 border border-sky-500/40 text-sky-400">
                PS-01
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-400 m-0">
              Explainable Search Intelligence for Google Ads
            </p>
          </div>
        </div>

        {/* Center: Active Dataset Indicator */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-navy-900/80 border border-navy-700/60 text-xs">
          <Database className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-slate-400">Dataset:</span>
          <span className="font-semibold text-slate-200 truncate max-w-[200px]" title={datasetName}>
            {datasetName}
          </span>
          {isDemo ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 border border-amber-500/30 text-amber-400 ml-1">
              DEMO MODE
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 ml-1">
              LIVE DATA ({totalRecords.toLocaleString()} rows)
            </span>
          )}
        </div>

        {/* Right: Actions, Theme, System Health */}
        <div className="flex items-center gap-2.5">
          <a
            href={sampleCsvUrl}
            download="sample_search_terms_template.csv"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-navy-900/60 hover:bg-navy-800 rounded-lg border border-navy-700 transition"
          >
            <FileText className="w-3.5 h-3.5 text-sky-400" />
            <span>Sample CSV</span>
          </a>

          <button
            onClick={onNavigateToUpload}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 rounded-lg shadow-md shadow-sky-500/20 transition active:scale-95"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload CSV</span>
          </button>

          <button
            onClick={onToggleTheme}
            aria-label="Toggle Theme"
            className="p-2 rounded-lg bg-navy-900/60 hover:bg-navy-800 text-slate-300 hover:text-white border border-navy-700 transition"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-sky-400" />}
          </button>

          <button
            onClick={onNavigateToHelp}
            aria-label="Help and Methodology"
            className="p-2 rounded-lg bg-navy-900/60 hover:bg-navy-800 text-slate-400 hover:text-white border border-navy-700 transition"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-medium text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Engine Active</span>
          </div>
        </div>
      </div>
    </header>
  );
};
