import React, { useState, useEffect } from 'react';
import { TabId, Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { DetailDrawer } from './components/DetailDrawer';
import { ToastContainer, ToastMessage } from './components/Toast';
import { DashboardSummary, SearchTermRecord, Decision } from './types';
import { api } from './services/api';

// Pages
import { OverviewDashboard } from './pages/OverviewDashboard';
import { UploadPreview } from './pages/UploadPreview';
import { SearchTermAnalysis } from './pages/SearchTermAnalysis';
import { HumanReviewQueue } from './pages/HumanReviewQueue';
import { QueryClusters } from './pages/QueryClusters';
import { NegativeKeywordBuilder } from './pages/NegativeKeywordBuilder';
import { SpendIntelligence } from './pages/SpendIntelligence';
import { CampaignAnalytics } from './pages/CampaignAnalytics';
import { ReviewerFeedbackView } from './pages/ReviewerFeedback';
import { AuditReports } from './pages/AuditReports';
import { SettingsAndHelp } from './pages/SettingsAndHelp';

export function App() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [highSpendRecords, setHighSpendRecords] = useState<SearchTermRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<SearchTermRecord | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const newToast: ToastMessage = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      title,
      message
    };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newToast.id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const fetchDashboardData = async () => {
    try {
      const sum = await api.getSummary();
      setSummary(sum);
      const results = await api.getResults({ page_size: 10, sort_by: 'cost', sort_dir: 'desc' });
      setHighSpendRecords(results.results || []);
    } catch (err: any) {
      console.error(err);
      addToast('error', 'Connection Error', 'Backend API is currently unreachable. Ensure Flask is running on port 5000.');
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (nextTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  };

  const handleSelectRecordById = async (rowId: string) => {
    try {
      const res = await api.getResults({ search: rowId, page_size: 1 });
      if (res.results && res.results.length > 0) {
        setSelectedRecord(res.results[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitReview = async (row_id: string, decision: Decision, reason: string, notes: string) => {
    try {
      await api.submitReview(row_id, decision, reason, notes);
      addToast('success', 'Review Override Saved', `Successfully updated record to ${decision}. Stored in SQLite.`);
      await fetchDashboardData();
    } catch (err: any) {
      addToast('error', 'Failed to Save Review', err.message);
      throw err;
    }
  };

  const handleLoadDemo = async () => {
    try {
      await api.loadDemoData();
      await fetchDashboardData();
      addToast('success', 'Demo Dataset Loaded', 'Loaded synthetic B2B & E-Commerce queries.');
    } catch (err: any) {
      addToast('error', 'Demo Load Failed', err.message);
    }
  };

  const handleUploadSuccess = (res: any) => {
    addToast('success', 'CSV Ingestion Complete', `Successfully processed ${res.processed_rows} rows (${res.rejected_rows_count} rejected).`);
    fetchDashboardData();
    setActiveTab('analysis');
  };

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'light' ? 'light bg-slate-50 text-slate-900' : 'bg-navy-950 text-slate-100'}`}>
      
      {/* Top Navbar */}
      <Navbar
        datasetName={summary?.dataset_name || 'No dataset loaded'}
        isDemo={summary?.is_demo ?? true}
        totalRecords={summary?.total_processed ?? 0}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onNavigateToUpload={() => setActiveTab('upload')}
        onNavigateToHelp={() => setActiveTab('settings')}
        sampleCsvUrl={api.getSampleCsvUrl()}
      />

      {/* Main Body Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          reviewQueueCount={summary?.decision_counts?.['HUMAN REVIEW'] ?? 0}
          negativeKeywordsCount={summary?.decision_counts?.BLOCK ?? 0}
        />

        {/* Dynamic Content Panel */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">

            {activeTab === 'dashboard' && (
              <OverviewDashboard
                summary={summary}
                onNavigateTab={setActiveTab}
                onSelectRecord={setSelectedRecord}
                highSpendRecords={highSpendRecords}
                onLoadDemo={handleLoadDemo}
              />
            )}

            {activeTab === 'upload' && (
              <UploadPreview
                onUploadSuccess={handleUploadSuccess}
                sampleCsvUrl={api.getSampleCsvUrl()}
                rejectedCsvUrl={api.getExportRejectedUrl()}
                currentDatasetName={summary?.dataset_name || 'Default'}
                isDemo={summary?.is_demo ?? true}
                totalRows={summary?.total_processed ?? 0}
                rejectedCount={summary?.total_rejected ?? 0}
              />
            )}

            {activeTab === 'analysis' && (
              <SearchTermAnalysis
                onSelectRecord={setSelectedRecord}
                exportResultsUrl={api.getExportResultsUrl()}
              />
            )}

            {activeTab === 'review-queue' && (
              <HumanReviewQueue
                onSelectRecord={setSelectedRecord}
                onRefreshSummary={fetchDashboardData}
              />
            )}

            {activeTab === 'clusters' && (
              <QueryClusters
                onSelectRecordById={handleSelectRecordById}
                onRefreshSummary={fetchDashboardData}
              />
            )}

            {activeTab === 'negatives' && (
              <NegativeKeywordBuilder
                exportNegativesUrl={api.getExportNegativesUrl()}
              />
            )}

            {activeTab === 'spend' && (
              <SpendIntelligence
                spendIntel={summary?.spend_intelligence || null}
                onSelectRecordById={handleSelectRecordById}
                onRefreshSummary={fetchDashboardData}
              />
            )}

            {activeTab === 'campaigns' && (
              <CampaignAnalytics
                campaignSummaries={summary?.spend_intelligence?.campaign_summaries || []}
              />
            )}

            {activeTab === 'feedback' && (
              <ReviewerFeedbackView />
            )}

            {activeTab === 'reports' && (
              <AuditReports
                summary={summary}
                exportResultsUrl={api.getExportResultsUrl()}
                exportNegativesUrl={api.getExportNegativesUrl()}
                exportRejectedUrl={api.getExportRejectedUrl()}
                auditHtmlUrl={api.getAuditReportHtmlUrl()}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsAndHelp
                onConfigSaved={fetchDashboardData}
              />
            )}

          </div>
        </main>
      </div>

      {/* Detail Explainable Drawer */}
      <DetailDrawer
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
        onSubmitReview={handleSubmitReview}
      />

      {/* Toast Notifications */}
      <ToastContainer
        toasts={toasts}
        onDismiss={removeToast}
      />

    </div>
  );
}

export default App;
