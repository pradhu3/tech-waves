import { 
  DashboardSummary, 
  SearchTermRecord, 
  QueryCluster, 
  NegativeKeyword, 
  ReviewFeedback, 
  ClassifierConfig, 
  SpendIntelligence 
} from '../types';

const API_BASE = '/api';

export const api = {
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Failed to fetch health status');
    return res.json();
  },

  async getSummary(): Promise<DashboardSummary> {
    const res = await fetch(`${API_BASE}/summary`);
    if (!res.ok) throw new Error('Failed to fetch dashboard summary');
    return res.json();
  },

  async getResults(params: {
    search?: string;
    decision?: string;
    campaign?: string;
    confidence?: string;
    human_review_only?: boolean;
    min_spend?: number;
    sort_by?: string;
    sort_dir?: 'asc' | 'desc';
    page?: number;
    page_size?: number;
  }): Promise<{
    status: string;
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
    campaigns: string[];
    results: SearchTermRecord[];
  }> {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.decision) query.append('decision', params.decision);
    if (params.campaign) query.append('campaign', params.campaign);
    if (params.confidence) query.append('confidence', params.confidence);
    if (params.human_review_only) query.append('human_review_only', 'true');
    if (params.min_spend !== undefined) query.append('min_spend', params.min_spend.toString());
    if (params.sort_by) query.append('sort_by', params.sort_by);
    if (params.sort_dir) query.append('sort_dir', params.sort_dir);
    if (params.page) query.append('page', params.page.toString());
    if (params.page_size) query.append('page_size', params.page_size.toString());

    const res = await fetch(`${API_BASE}/results?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch results');
    return res.json();
  },

  async getClusters(): Promise<{ status: string; clusters: QueryCluster[] }> {
    const res = await fetch(`${API_BASE}/clusters`);
    if (!res.ok) throw new Error('Failed to fetch clusters');
    return res.json();
  },

  async getReviewQueue(): Promise<{ status: string; count: number; items: SearchTermRecord[] }> {
    const res = await fetch(`${API_BASE}/review-queue`);
    if (!res.ok) throw new Error('Failed to fetch review queue');
    return res.json();
  },

  async submitReview(row_id: string, decision: string, reason: string = '', notes: string = '') {
    const res = await fetch(`${API_BASE}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ row_id, decision, reason, notes })
    });
    if (!res.ok) throw new Error('Failed to submit review');
    return res.json();
  },

  async getFeedback(): Promise<{ status: string; feedback: ReviewFeedback[] }> {
    const res = await fetch(`${API_BASE}/feedback`);
    if (!res.ok) throw new Error('Failed to fetch reviewer feedback');
    return res.json();
  },

  async deleteFeedback(id: number) {
    const res = await fetch(`${API_BASE}/feedback/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete feedback');
    return res.json();
  },

  async clearFeedback() {
    const res = await fetch(`${API_BASE}/feedback/clear`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to clear feedback');
    return res.json();
  },

  async getNegativeKeywords(): Promise<{ status: string; negative_keywords: NegativeKeyword[] }> {
    const res = await fetch(`${API_BASE}/negative-keywords`);
    if (!res.ok) throw new Error('Failed to fetch negative keywords');
    return res.json();
  },

  async updateNegativeKeyword(id: number, updates: Partial<NegativeKeyword>) {
    const res = await fetch(`${API_BASE}/negative-keywords/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, updates })
    });
    if (!res.ok) throw new Error('Failed to update negative keyword');
    return res.json();
  },

  async simulateSpend(params: {
    negative_spend_cutoff: number;
    negative_adoption_rate: number;
  }): Promise<{ status: string; simulation_results: SpendIntelligence }> {
    const res = await fetch(`${API_BASE}/spend/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error('Failed to run spend simulation');
    return res.json();
  },

  async uploadCSV(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(err.error || 'Upload failed');
    }
    return res.json();
  },

  async loadDemoData() {
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ load_demo: true })
    });
    if (!res.ok) throw new Error('Failed to load demo data');
    return res.json();
  },

  async getConfig(): Promise<{ status: string; config: ClassifierConfig }> {
    const res = await fetch(`${API_BASE}/config`);
    if (!res.ok) throw new Error('Failed to fetch config');
    return res.json();
  },

  async updateConfig(config: Partial<ClassifierConfig>) {
    const res = await fetch(`${API_BASE}/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    if (!res.ok) throw new Error('Failed to update config');
    return res.json();
  },

  getSampleCsvUrl: () => `${API_BASE}/sample-csv`,
  getExportResultsUrl: () => `${API_BASE}/export/results`,
  getExportNegativesUrl: () => `${API_BASE}/export/negatives`,
  getExportRejectedUrl: () => `${API_BASE}/export/rejected`,
  getAuditReportHtmlUrl: () => `${API_BASE}/audit-report?format=html`,
};
