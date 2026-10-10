import pytest
import io
import json
import pandas as pd
from backend.services.data_validator import validate_and_process_csv, clean_numeric_value, map_columns
from backend.services.confidence import calculate_confidence_score
from backend.services.classifier import classify_search_term, batch_classify_records, analyze_query_intent
from backend.services.clustering import cluster_search_terms, compute_jaccard_similarity
from backend.services.spend_analysis import analyze_spend_intelligence
from backend.services.report_generator import sanitize_csv_cell, generate_csv_export, generate_negatives_csv
from backend.services.db import (
    init_db, save_feedback, get_all_feedback, clear_all_feedback,
    save_negative_keywords, get_all_negative_keywords, clear_negative_keywords
)

@pytest.fixture(autouse=True)
def setup_test_db():
    init_db()
    clear_all_feedback()
    clear_negative_keywords()
    yield
    clear_all_feedback()
    clear_negative_keywords()

def test_numeric_cleaning_and_zero_distinction():
    # Recorded 0 vs missing
    val_zero, ok1 = clean_numeric_value("0.0")
    assert ok1 is True
    assert val_zero == 0.0

    val_int_zero, ok2 = clean_numeric_value(0)
    assert ok2 is True
    assert val_int_zero == 0.0

    # Missing values
    val_none, ok3 = clean_numeric_value(None)
    assert ok3 is True
    assert val_none is None

    val_empty, ok4 = clean_numeric_value("")
    assert ok4 is True
    assert val_empty is None

    val_na, ok5 = clean_numeric_value("N/A")
    assert ok5 is True
    assert val_na is None

    # Currency and commas
    val_curr, ok6 = clean_numeric_value("$1,250.50")
    assert ok6 is True
    assert val_curr == 1250.50

    # Malformed text
    val_bad, ok7 = clean_numeric_value("invalid_text")
    assert ok7 is False
    assert val_bad is None

def test_csv_validation_missing_required_column():
    csv_missing_query = "Campaign,Clicks,Cost\nBrand Campaign,100,50.0"
    res = validate_and_process_csv(csv_missing_query)
    assert res['status'] == 'error'
    assert "Required 'Search Term'" in res['error']

def test_csv_validation_empty_query_rejected():
    csv_text = "Search Term,Clicks,Cost,Conversions\n,50,25.0,2\nvalid search term,30,15.0,1"
    res = validate_and_process_csv(csv_text)
    assert res['status'] == 'success'
    assert len(res['records']) == 1
    assert len(res['rejected_rows']) == 1
    assert res['rejected_rows'][0]['reason'] == 'Empty or missing search term'

def test_csv_validation_malformed_numeric_rejected():
    csv_text = "Search Term,Clicks,Cost,Conversions\nbad numeric row,abc,25.0,2\ngood row,10,5.0,0"
    res = validate_and_process_csv(csv_text)
    assert res['status'] == 'success'
    assert len(res['records']) == 1
    assert len(res['rejected_rows']) == 1
    assert "Malformed numeric value" in res['rejected_rows'][0]['reason']

def test_low_sample_conversion_anomaly_routed_to_human_review():
    # 2 clicks and 1 conversion MUST route to HUMAN REVIEW
    record = {
        'row_id': 'row_1',
        'search_term': 'cheap sales software discount',
        'campaign': 'B2B',
        'ad_group': 'Sales',
        'impressions': 15,
        'clicks': 2,
        'cost': 8.50,
        'conversions': 1.0,
        'conversion_value': 100.0,
        'ctr': 13.3,
        'cpa': 8.50
    }
    result = classify_search_term(record)
    assert result['recommendation'] == 'HUMAN REVIEW'
    assert "RULE_LOW_SAMPLE_CONVERSION_ANOMALY" in result['rules_triggered']
    assert result['confidence_details']['label'] == 'Low' or result['confidence'] < 60.0

def test_zero_conversions_does_not_blindly_trigger_block():
    # High spend with commercial intent should route to HUMAN REVIEW, not auto BLOCK
    record = {
        'row_id': 'row_2',
        'search_term': 'enterprise salesforce consulting services agency',
        'campaign': 'Consulting',
        'ad_group': 'Enterprise',
        'impressions': 1500,
        'clicks': 50,
        'cost': 450.0,
        'conversions': 0.0,
        'conversion_value': 0.0,
        'ctr': 3.33,
        'cpa': None
    }
    result = classify_search_term(record)
    assert result['recommendation'] == 'HUMAN REVIEW'
    assert "commercial intent" in result['explanation'].lower()

def test_irrelevant_intent_triggers_block():
    # Irrelevant intent (piracy / crack) with spend should BLOCK
    record = {
        'row_id': 'row_3',
        'search_term': 'free download cracked crm software torrent',
        'campaign': 'Software',
        'ad_group': 'CRM',
        'impressions': 2000,
        'clicks': 80,
        'cost': 220.0,
        'conversions': 0.0,
        'conversion_value': 0.0,
        'ctr': 4.0,
        'cpa': None
    }
    result = classify_search_term(record)
    assert result['recommendation'] == 'BLOCK'
    assert result['suggested_negative'] in ['free', 'cracked', 'torrent', 'free download cracked crm software torrent']

def test_proven_performer_triggers_promote():
    record = {
        'row_id': 'row_4',
        'search_term': 'enterprise crm software platform',
        'campaign': 'Software',
        'ad_group': 'CRM',
        'impressions': 2500,
        'clicks': 120,
        'cost': 480.0,
        'conversions': 12.0,
        'conversion_value': 6000.0,
        'ctr': 4.8,
        'cpa': 40.0,
        'roas': 12.5
    }
    result = classify_search_term(record)
    assert result['recommendation'] == 'PROMOTE'
    assert result['confidence_label'] == 'High'
    assert result['confidence'] >= 75.0

def test_clustering_and_conflict_detection():
    records = [
        {
            'row_id': 'r1',
            'search_term': 'buy running shoes online',
            'campaign': 'Shoes',
            'ad_group': 'Running',
            'cost': 120.0,
            'clicks': 40,
            'conversions': 4.0,
            'recommendation': 'PROMOTE',
            'confidence': 88.0
        },
        {
            'row_id': 'r2',
            'search_term': 'buy shoes for running online free torrent',
            'campaign': 'Shoes',
            'ad_group': 'Running',
            'cost': 85.0,
            'clicks': 30,
            'conversions': 0.0,
            'recommendation': 'BLOCK',
            'confidence': 90.0
        }
    ]
    clusters = cluster_search_terms(records, similarity_threshold=0.4)
    assert len(clusters) >= 1
    # Check if conflict detected
    if any(c['has_conflicts'] for c in clusters):
        conflicting_cluster = [c for c in clusters if c['has_conflicts']][0]
        assert 'PROMOTE' in conflicting_cluster['decision_breakdown']
        assert 'BLOCK' in conflicting_cluster['decision_breakdown']

def test_csv_injection_sanitization():
    unsafe_val = "=cmd|' /C calc'!A0"
    safe_val = sanitize_csv_cell(unsafe_val)
    assert safe_val.startswith("'")

    unsafe_plus = "+1234567890"
    assert sanitize_csv_cell(unsafe_plus).startswith("'")

    safe_text = "regular search query"
    assert sanitize_csv_cell(safe_text) == "regular search query"

def test_reviewer_feedback_persistence():
    save_feedback(
        row_id="row_100",
        search_term="test query for analyst override",
        campaign="Test Campaign",
        ad_group="Test Ad Group",
        original_decision="HUMAN REVIEW",
        reviewer_decision="PROMOTE",
        reason="Approved after examining 90-day offline revenue"
    )
    all_fb = get_all_feedback()
    assert len(all_fb) == 1
    assert all_fb[0]['search_term'] == "test query for analyst override"
    assert all_fb[0]['reviewer_decision'] == "PROMOTE"

def test_large_dataset_performance_25k_rows():
    # Synthetic generation of 25,000 rows
    num_rows = 25000
    queries = [
        "best enterprise crm tool",
        "free cracked erp download",
        "cloud inventory software demo",
        "sales automation pricing",
        "business software jobs salary"
    ]
    data = []
    for i in range(num_rows):
        q = queries[i % len(queries)]
        data.append({
            'Search Term': f"{q} {i}",
            'Match Type': 'Broad',
            'Campaign': 'Large Scaled Campaign',
            'Ad Group': 'Scale Group',
            'Impressions': 100 + (i % 50),
            'Clicks': 5 + (i % 20),
            'Cost': 10.0 + (i % 50),
            'Conversions': (1.0 if (i % 10 == 0) else 0.0),
            'Conv. Value': (100.0 if (i % 10 == 0) else 0.0)
        })
    
    df = pd.DataFrame(data)
    val_res = validate_and_process_csv(df)
    assert val_res['status'] == 'success'
    assert len(val_res['records']) == 25000

    # Batch classify all 25k records
    classified = batch_classify_records(val_res['records'])
    assert len(classified) == 25000
    
    # Spend analysis
    spend_res = analyze_spend_intelligence(classified)
    assert spend_res['total_spend'] > 0
    assert spend_res['blocked_spend'] > 0
