import React, { useState, useEffect } from 'react';
import { ClassifierConfig } from '../types';
import { api } from '../services/api';
import {
  Sliders,
  Save,
  RotateCcw,
  BookOpen,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  FileCheck2,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

interface SettingsAndHelpProps {
  onConfigSaved: () => void;
}

export const SettingsAndHelp: React.FC<SettingsAndHelpProps> = ({ onConfigSaved }) => {
  const [config, setConfig] = useState<ClassifierConfig>({
    min_clicks_for_promote: 15,
    min_conv_for_promote: 2.0,
    max_cpa_for_promote: 150.0,
    min_roas_for_promote: 1.5,
    min_spend_for_block: 40.0,
    high_spend_review_threshold: 250.0,
    min_clicks_for_block: 12,
    low_sample_click_cutoff: 5
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchCfg = async () => {
      setIsLoading(true);
      try {
        const res = await api.getConfig();
        if (res.config) setConfig(res.config);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCfg();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.updateConfig(config);
      setSaveSuccess(true);
      onConfigSaved();
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setConfig({
      min_clicks_for_promote: 15,
      min_conv_for_promote: 2.0,
      max_cpa_for_promote: 150.0,
      min_roas_for_promote: 1.5,
      min_spend_for_block: 40.0,
      high_spend_review_threshold: 250.0,
      min_clicks_for_block: 12,
      low_sample_click_cutoff: 5
    });
  };

  return (
    <div className="space-y-8">

      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border-sky-500/20 bg-gradient-to-r from-navy-900 via-navy-850 to-indigo-950/20">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-sky-500/20 text-sky-400 uppercase tracking-wider flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5" />
            <span>Engine Configuration &amp; Methodology</span>
          </span>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight m-0">
          Engine Settings &amp; Explainability Documentation
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl m-0 leading-relaxed">
          Calibrate classification rule thresholds, CPA caps, and uncertainty sensitivity. All modifications re-index active dataset decisions without requiring code changes.
        </p>
      </div>

      {/* Configuration Form */}
      <div className="glass-panel p-6 rounded-2xl border-navy-700/80">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-navy-800">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight m-0">
              Classification Rule Thresholds
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 m-0">
              Tune criteria for automated PROMOTE, BLOCK, and HUMAN REVIEW routing
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-navy-800 hover:bg-navy-700 rounded-lg transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Min Clicks for PROMOTE
              </label>
              <input
                type="number"
                min={5}
                max={100}
                value={config.min_clicks_for_promote}
                onChange={(e) => setConfig({ ...config, min_clicks_for_promote: Number(e.target.value) })}
                className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Prevents promotion before statistical relevance.</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Min Conversions for PROMOTE
              </label>
              <input
                type="number"
                min={1}
                max={20}
                step={1}
                value={config.min_conv_for_promote}
                onChange={(e) => setConfig({ ...config, min_conv_for_promote: Number(e.target.value) })}
                className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Strictly requires repeated conversion signal (&gt;= 2).</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Max Acceptable CPA ($)
              </label>
              <input
                type="number"
                min={10}
                max={1000}
                value={config.max_cpa_for_promote}
                onChange={(e) => setConfig({ ...config, max_cpa_for_promote: Number(e.target.value) })}
                className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Upper bound for cost per acquisition eligibility.</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Min Spend to BLOCK ($)
              </label>
              <input
                type="number"
                min={10}
                max={500}
                value={config.min_spend_for_block}
                onChange={(e) => setConfig({ ...config, min_spend_for_block: Number(e.target.value) })}
                className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Cutoff before non-commercial query triggers negative action.</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                High Spend Review Threshold ($)
              </label>
              <input
                type="number"
                min={50}
                max={2000}
                value={config.high_spend_review_threshold}
                onChange={(e) => setConfig({ ...config, high_spend_review_threshold: Number(e.target.value) })}
                className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Spend at 0 conversions routed to review if intent is commercial.</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Low Sample Click Cutoff
              </label>
              <input
                type="number"
                min={1}
                max={15}
                value={config.low_sample_click_cutoff}
                onChange={(e) => setConfig({ ...config, low_sample_click_cutoff: Number(e.target.value) })}
                className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Queries with &le; this number of clicks and 1 conv route to review.</span>
            </div>

          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-navy-800">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 shadow-lg shadow-sky-500/20 transition active:scale-95 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Re-analyzing Dataset...' : saveSuccess ? 'Saved & Re-analyzed!' : 'Save & Re-Index Engine'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Methodology & Documentation Accordion / Section */}
      <div className="glass-panel p-6 rounded-2xl space-y-6">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-sky-400" />
          <h3 className="text-base font-bold text-white tracking-tight m-0">
            System Architecture &amp; Safeguards Documentation
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs text-slate-300">
          
          <div className="p-4 rounded-xl bg-navy-900/60 border border-navy-800 space-y-2">
            <h4 className="font-bold text-emerald-400 flex items-center gap-2 m-0 text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Promote Decision Logic</span>
            </h4>
            <p className="leading-relaxed m-0 text-slate-400">
              Never promotes based solely on conversions &gt; 0. Requires verified sample volume (clicks &ge; {config.min_clicks_for_promote}), repeated conversions (&ge; {config.min_conv_for_promote}), and a profitable CPA &le; ${config.max_cpa_for_promote}.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-navy-900/60 border border-navy-800 space-y-2">
            <h4 className="font-bold text-rose-400 flex items-center gap-2 m-0 text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Block &amp; Negative Keyword Logic</span>
            </h4>
            <p className="leading-relaxed m-0 text-slate-400">
              Never blocks based solely on conversions == 0. Verifies negative intent tokens (e.g. "free", "crack", "torrent", "jobs", "salary", "pdf tutorial") or extreme high spend with non-commercial intent.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-navy-900/60 border border-navy-800 space-y-2">
            <h4 className="font-bold text-amber-400 flex items-center gap-2 m-0 text-xs uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4" />
              <span>Uncertainty &amp; Fluke Detection</span>
            </h4>
            <p className="leading-relaxed m-0 text-slate-400">
              A search query with 2 clicks and 1 conversion is explicitly routed to <strong>HUMAN REVIEW</strong>. In small samples, a single conversion has wide error margins and may represent chance rather than true product-market fit.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-navy-900/60 border border-navy-800 space-y-2">
            <h4 className="font-bold text-sky-400 flex items-center gap-2 m-0 text-xs uppercase tracking-wider">
              <HelpCircle className="w-4 h-4" />
              <span>Heuristic Confidence Indicator</span>
            </h4>
            <p className="leading-relaxed m-0 text-slate-400">
              Confidence scores (0-100%) are mathematically modeled across data completeness (25%), sample volume sufficiency (35%), intent clarity (25%), and signal agreement (15%). Clearly labeled as an evidence indicator rather than an arbitrary black-box probability.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};
