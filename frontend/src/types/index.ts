export type Decision = 'PROMOTE' | 'BLOCK' | 'IGNORE' | 'HUMAN REVIEW';

export type ConfidenceLabel = 'High' | 'Medium' | 'Low';

export interface ConfidenceDetails {
  score: number;
  label: ConfidenceLabel;
  breakdown: {
    completeness_score: number;
    sample_score: number;
    intent_score: number;
    agreement_score: number;
  };
  uncertainty_factors: string[];
  missing_data: string[];
}

export interface SearchTermRecord {
  row_id: string;
  row_number: number;
  search_term: string;
  campaign: string;
  ad_group: string;
  match_type: string;
  date?: string | null;
  impressions?: number | null;
  clicks?: number | null;
  cost?: number | null;
  conversions?: number | null;
  conversion_value?: number | null;
  ctr?: number | null;
  cpc?: number | null;
  cvr?: number | null;
  cpa?: number | null;
  roas?: number | null;
  recommendation: Decision;
  confidence: number;
  confidence_label: ConfidenceLabel;
  confidence_details?: ConfidenceDetails;
  intent_type?: string;
  intent_tokens?: string[];
  positive_evidence: string[];
  negative_evidence: string[];
  missing_data: string[];
  uncertainty_factors: string[];
  rules_triggered: string[];
  explanation: string;
  recommended_next_action: string;
  suggested_negative?: string;
  suggested_scope?: 'Campaign' | 'Ad Group';
  suggested_match_type?: 'Exact' | 'Phrase' | 'Broad';
  review_status: string;
}

export interface ClusterItem {
  row_id: string;
  search_term: string;
  campaign: string;
  ad_group: string;
  recommendation: Decision;
  confidence: number;
  clicks?: number;
  cost?: number;
  conversions?: number;
  cpa?: number;
}

export interface QueryCluster {
  cluster_id: string;
  cluster_name: string;
  terms_count: number;
  total_spend: number;
  total_clicks: number;
  total_conversions: number;
  has_conflicts: boolean;
  conflict_summary?: string;
  decision_breakdown: Record<string, number>;
  terms: ClusterItem[];
  method: string;
}

export interface NegativeKeyword {
  id: number;
  row_id?: string;
  search_term: string;
  suggested_negative: string;
  campaign: string;
  ad_group: string;
  match_type: 'Exact' | 'Phrase' | 'Broad';
  scope: 'Campaign' | 'Ad Group';
  reason?: string;
  confidence?: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Exported';
  timestamp: string;
}

export interface CampaignSummary {
  campaign: string;
  total_spend: number;
  blocked_spend: number;
  review_spend: number;
  promote_spend: number;
  conversions: number;
  conversion_value: number;
  cpa?: number | null;
  roas?: number | null;
  query_count: number;
  potential_savings_rate: number;
}

export interface SpendIntelligence {
  total_spend: number;
  blocked_spend: number;
  review_spend: number;
  promote_spend: number;
  ignore_spend: number;
  estimated_avoidable_spend: number;
  avoidable_spend_percentage: number;
  blocked_spend_percentage: number;
  review_spend_percentage: number;
  assumptions: string[];
  campaign_summaries: CampaignSummary[];
  high_cost_investigations: Array<{
    row_id: string;
    search_term: string;
    campaign: string;
    cost: number;
    conversions: number;
    clicks: number;
    reason: string;
  }>;
  simulation_params?: {
    negative_spend_cutoff: number;
    negative_adoption_rate: number;
    target_cpa_threshold?: number;
  };
}

export interface DashboardSummary {
  status: string;
  dataset_name: string;
  is_demo: boolean;
  total_processed: number;
  total_rejected: number;
  decision_counts: {
    PROMOTE: number;
    BLOCK: number;
    IGNORE: number;
    'HUMAN REVIEW': number;
  };
  confidence_counts: {
    High: number;
    Medium: number;
    Low: number;
  };
  kpi_metrics: {
    total_spend: number;
    total_clicks: number;
    total_conversions: number;
    total_conversion_value: number;
    estimated_avoidable_spend: number;
    blocked_spend: number;
    review_spend: number;
  };
  spend_intelligence: SpendIntelligence;
  recent_audit_logs: Array<{
    id: number;
    session_id: string;
    dataset_name: string;
    row_count: number;
    promote_count: number;
    block_count: number;
    ignore_count: number;
    review_count: number;
    total_spend: number;
    created_at: string;
  }>;
}

export interface ReviewFeedback {
  id: number;
  row_id: string;
  search_term: string;
  campaign: string;
  ad_group: string;
  original_decision: Decision;
  reviewer_decision: Decision;
  reason: string;
  notes: string;
  timestamp: string;
}

export interface RejectedRow {
  row_id: string;
  row_number: number;
  search_term: string;
  reason: string;
  raw_data: Record<string, any>;
}

export interface ClassifierConfig {
  min_clicks_for_promote: number;
  min_conv_for_promote: number;
  max_cpa_for_promote: number;
  min_roas_for_promote: number;
  min_spend_for_block: number;
  high_spend_review_threshold: number;
  min_clicks_for_block: number;
  low_sample_click_cutoff: number;
}
