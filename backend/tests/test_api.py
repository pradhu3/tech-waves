import pytest
import json
import io
from backend.services.data_validator import generate_sample_csv_template, validate_and_process_csv
from backend.services.classifier import batch_classify_records, DEFAULT_CONFIG
from backend.services.clustering import cluster_search_terms
from backend.services.spend_analysis import analyze_spend_intelligence
from backend.services.db import clear_negative_keywords, save_negative_keywords
from backend.app import app, ACTIVE_STATE

@pytest.fixture(scope="module")
def client():
    app.config['TESTING'] = True
    val_res = validate_and_process_csv(generate_sample_csv_template())
    analyzed = batch_classify_records(val_res['records'], config=DEFAULT_CONFIG)
    ACTIVE_STATE['session_id'] = 'test-session-id'
    ACTIVE_STATE['dataset_name'] = 'Test Template Sample'
    ACTIVE_STATE['is_demo'] = True
    ACTIVE_STATE['records'] = analyzed
    ACTIVE_STATE['rejected_rows'] = val_res['rejected_rows']
    ACTIVE_STATE['metadata'] = val_res['metadata']
    ACTIVE_STATE['clusters'] = cluster_search_terms(analyzed)
    ACTIVE_STATE['spend_intel'] = analyze_spend_intelligence(analyzed)
    
    clear_negative_keywords()
    negs = [
        {
            'row_id': r.get('row_id'),
            'search_term': r.get('search_term'),
            'suggested_negative': r.get('suggested_negative', r.get('search_term')),
            'campaign': r.get('campaign'),
            'ad_group': r.get('ad_group'),
            'match_type': r.get('suggested_match_type', 'Exact'),
            'scope': r.get('suggested_scope', 'Campaign'),
            'reason': r.get('explanation'),
            'confidence': r.get('confidence', 0),
            'status': 'Pending'
        } for r in analyzed if r.get('recommendation') == 'BLOCK'
    ]
    if negs:
        save_negative_keywords(negs)

    with app.test_client() as client:
        yield client

def test_api_health(client):
    rv = client.get('/api/health')
    assert rv.status_code == 200
    data = rv.get_json()
    assert data['status'] == 'healthy'
    assert data['service'] == 'Search Term Triage Engine (PS-01)'
    assert data['record_count'] > 0

def test_api_summary(client):
    rv = client.get('/api/summary')
    assert rv.status_code == 200
    data = rv.get_json()
    assert 'decision_counts' in data
    assert 'kpi_metrics' in data
    assert data['decision_counts']['PROMOTE'] > 0
    assert data['decision_counts']['BLOCK'] > 0
    assert data['decision_counts']['HUMAN REVIEW'] > 0

def test_api_results_filtering(client):
    rv = client.get('/api/results?decision=PROMOTE')
    assert rv.status_code == 200
    data = rv.get_json()
    for row in data['results']:
        assert row['recommendation'] == 'PROMOTE'

def test_api_review_queue(client):
    rv = client.get('/api/review-queue')
    assert rv.status_code == 200
    data = rv.get_json()
    assert 'items' in data
    assert data['count'] > 0

def test_api_reviewer_action(client):
    # Find a record in review queue
    q_rv = client.get('/api/review-queue')
    queue_data = q_rv.get_json()
    assert len(queue_data['items']) > 0
    target_row_id = queue_data['items'][0]['row_id']

    # Submit review override
    post_rv = client.post('/api/review', json={
        'row_id': target_row_id,
        'decision': 'BLOCK',
        'reason': 'Confirmed irrelevant query pattern by analyst',
        'notes': 'Added to campaign negative list'
    })
    assert post_rv.status_code == 200
    res_data = post_rv.get_json()
    assert res_data['status'] == 'success'
    assert res_data['updated_record']['recommendation'] == 'BLOCK'

def test_api_spend_simulation(client):
    rv = client.post('/api/spend/simulate', json={
        'negative_spend_cutoff': 20.0,
        'negative_adoption_rate': 0.95
    })
    assert rv.status_code == 200
    data = rv.get_json()
    assert 'simulation_results' in data
    assert data['simulation_results']['estimated_avoidable_spend'] >= 0

def test_api_negative_keywords(client):
    rv = client.get('/api/negative-keywords')
    assert rv.status_code == 200
    data = rv.get_json()
    assert 'negative_keywords' in data
    assert len(data['negative_keywords']) > 0

def test_api_export_results(client):
    rv = client.get('/api/export/results')
    assert rv.status_code == 200
    assert rv.mimetype == 'text/csv'
    csv_text = rv.data.decode('utf-8')
    assert 'Search Term' in csv_text
    assert 'Recommendation' in csv_text

def test_api_export_negatives(client):
    rv = client.get('/api/export/negatives')
    assert rv.status_code == 200
    assert rv.mimetype == 'text/csv'
    csv_text = rv.data.decode('utf-8')
    assert 'Keyword' in csv_text
    assert 'Criterion Type' in csv_text

def test_api_upload_file(client):
    csv_content = (
        "Search term,Match type,Campaign,Ad group,Impressions,Clicks,Cost,Conversions,Conv. value\n"
        "cloud accounting software,Phrase,SaaS,Accounting,500,40,120.0,6,1200.0\n"
        "free pirate keygen,Broad,SaaS,Accounting,800,50,90.0,0,0\n"
    )
    data = {
        'file': (io.BytesIO(csv_content.encode('utf-8')), 'test_upload.csv')
    }
    rv = client.post('/api/upload', data=data)
    assert rv.status_code == 200, f"Response: {rv.get_json()}"
    res = rv.get_json()
    assert res['processed_rows'] == 2
    assert res['dataset_name'] == 'test_upload.csv'
