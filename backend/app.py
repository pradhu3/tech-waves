import os
import sys
import io
import json
import uuid

# Ensure backend directory is in sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from flask import Flask, request, jsonify, Response, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename

from services.db import (
    init_db, save_feedback, get_all_feedback, delete_feedback_item, clear_all_feedback,
    save_negative_keywords, get_all_negative_keywords, update_negative_keyword, clear_negative_keywords,
    save_audit_log, get_audit_logs, get_config_setting, set_config_setting
)
from services.data_validator import validate_and_process_csv, generate_sample_csv_template
from services.classifier import batch_classify_records, DEFAULT_CONFIG
from services.clustering import cluster_search_terms
from services.spend_analysis import analyze_spend_intelligence
from services.report_generator import (
    generate_csv_export, generate_negatives_csv, generate_rejected_rows_csv, generate_executive_audit_report
)

app = Flask(__name__)
# Configure CORS for local development across Vite ports (5173, 3000, etc.)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Max payload 64MB for handling 25,000+ row CSVs
app.config['MAX_CONTENT_LENGTH'] = 64 * 1024 * 1024

# Active session in-memory state
ACTIVE_STATE = {
    'session_id': None,
    'dataset_name': 'No dataset loaded',
    'is_demo': False,
    'records': [],
    'rejected_rows': [],
    'metadata': {},
    'clusters': [],
    'spend_intel': {},
    'config': DEFAULT_CONFIG.copy()
}

def load_initial_demo_data():
    """Pre-populates dataset with the official PS-01 dataset or template sample."""
    official_csv_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'sample_data', 'search_terms_report.csv')
    
    if os.path.exists(official_csv_path):
        val_res = validate_and_process_csv(official_csv_path)
        dataset_name = 'PS-01 Official Dataset (25,000 search terms)'
        is_demo = False
    else:
        sample_csv_text = generate_sample_csv_template()
        val_res = validate_and_process_csv(sample_csv_text)
        dataset_name = 'Demo Dataset (B2B SaaS & Financial Services)'
        is_demo = True

    if val_res['status'] == 'success':
        analyzed_records = batch_classify_records(val_res['records'], config=DEFAULT_CONFIG)
        clusters = cluster_search_terms(analyzed_records)
        spend_intel = analyze_spend_intelligence(analyzed_records)
        
        ACTIVE_STATE['session_id'] = str(uuid.uuid4())
        ACTIVE_STATE['dataset_name'] = dataset_name
        ACTIVE_STATE['is_demo'] = is_demo
        ACTIVE_STATE['records'] = analyzed_records
        ACTIVE_STATE['rejected_rows'] = val_res['rejected_rows']
        ACTIVE_STATE['metadata'] = val_res['metadata']
        ACTIVE_STATE['clusters'] = clusters
        ACTIVE_STATE['spend_intel'] = spend_intel

        # Populate negative keywords in DB for the demo dataset
        clear_negative_keywords()
        negatives = []
        for r in analyzed_records:
            if r.get('recommendation') == 'BLOCK':
                negatives.append({
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
                })
        if negatives:
            save_negative_keywords(negatives)

# Load demo data on startup
load_initial_demo_data()

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'service': 'Search Term Triage Engine (PS-01)',
        'active_session': ACTIVE_STATE['session_id'],
        'dataset_loaded': ACTIVE_STATE['dataset_name'],
        'is_demo': ACTIVE_STATE['is_demo'],
        'record_count': len(ACTIVE_STATE['records'])
    })

@app.route('/api/sample-csv', methods=['GET'])
def get_sample_csv():
    sample_csv_text = generate_sample_csv_template()
    return Response(
        sample_csv_text,
        mimetype="text/csv",
        headers={"Content-disposition": "attachment; filename=sample_search_terms_template.csv"}
    )

@app.route('/api/upload', methods=['POST'])
def upload_csv():
    if 'file' not in request.files:
        # Check if user requested to load demo mode
        if request.is_json and request.json.get('load_demo'):
            load_initial_demo_data()
            return jsonify({
                'status': 'success',
                'message': 'Loaded demo dataset successfully.',
                'metadata': ACTIVE_STATE['metadata'],
                'dataset_name': ACTIVE_STATE['dataset_name'],
                'is_demo': True
            })
        return jsonify({'status': 'error', 'error': 'No file uploaded'}), 400

    uploaded_file = request.files['file']
    if uploaded_file.filename == '':
        return jsonify({'status': 'error', 'error': 'Empty filename'}), 400

    safe_name = secure_filename(uploaded_file.filename)
    if not safe_name.lower().endswith('.csv'):
        return jsonify({'status': 'error', 'error': 'Only CSV files (.csv) are supported'}), 400

    try:
        content = uploaded_file.read()
        val_result = validate_and_process_csv(content)
        
        if val_result['status'] == 'error':
            return jsonify(val_result), 400

        # Classify the uploaded data
        analyzed_records = batch_classify_records(val_result['records'], config=ACTIVE_STATE['config'])
        clusters = cluster_search_terms(analyzed_records)
        spend_intel = analyze_spend_intelligence(analyzed_records)

        new_session_id = str(uuid.uuid4())
        ACTIVE_STATE['session_id'] = new_session_id
        ACTIVE_STATE['dataset_name'] = safe_name
        ACTIVE_STATE['is_demo'] = False
        ACTIVE_STATE['records'] = analyzed_records
        ACTIVE_STATE['rejected_rows'] = val_result['rejected_rows']
        ACTIVE_STATE['metadata'] = val_result['metadata']
        ACTIVE_STATE['clusters'] = clusters
        ACTIVE_STATE['spend_intel'] = spend_intel

        # Save negatives to DB
        clear_negative_keywords()
        negatives = []
        for r in analyzed_records:
            if r.get('recommendation') == 'BLOCK':
                negatives.append({
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
                })
        if negatives:
            save_negative_keywords(negatives)

        # Log audit entry
        promote_cnt = sum(1 for r in analyzed_records if r.get('recommendation') == 'PROMOTE')
        block_cnt = sum(1 for r in analyzed_records if r.get('recommendation') == 'BLOCK')
        ignore_cnt = sum(1 for r in analyzed_records if r.get('recommendation') == 'IGNORE')
        review_cnt = sum(1 for r in analyzed_records if r.get('recommendation') == 'HUMAN REVIEW')
        
        save_audit_log(
            session_id=new_session_id,
            dataset_name=safe_name,
            row_count=len(analyzed_records),
            promote_count=promote_cnt,
            block_count=block_cnt,
            ignore_count=ignore_cnt,
            review_count=review_cnt,
            total_spend=spend_intel['total_spend']
        )

        return jsonify({
            'status': 'success',
            'dataset_name': safe_name,
            'is_demo': False,
            'total_rows': val_result['metadata']['total_rows'],
            'processed_rows': len(analyzed_records),
            'rejected_rows_count': len(val_result['rejected_rows']),
            'preview': analyzed_records[:10],
            'metadata': val_result['metadata']
        })

    except Exception as e:
        return jsonify({'status': 'error', 'error': f"Failed processing file: {str(e)}"}), 500

@app.route('/api/analyze', methods=['POST'])
def trigger_analysis():
    """Re-analyzes current dataset with updated thresholds or reviewer rules."""
    req_config = request.json.get('config', {}) if request.is_json else {}
    ACTIVE_STATE['config'].update(req_config)
    
    if not ACTIVE_STATE['records']:
        return jsonify({'status': 'error', 'error': 'No dataset loaded to analyze'}), 400

    analyzed = batch_classify_records(ACTIVE_STATE['records'], config=ACTIVE_STATE['config'])
    clusters = cluster_search_terms(analyzed)
    spend_intel = analyze_spend_intelligence(analyzed)

    ACTIVE_STATE['records'] = analyzed
    ACTIVE_STATE['clusters'] = clusters
    ACTIVE_STATE['spend_intel'] = spend_intel

    return jsonify({
        'status': 'success',
        'dataset_name': ACTIVE_STATE['dataset_name'],
        'total_processed': len(analyzed)
    })

@app.route('/api/summary', methods=['GET'])
def get_dashboard_summary():
    records = ACTIVE_STATE['records']
    
    # Counts
    promote_count = 0
    block_count = 0
    ignore_count = 0
    review_count = 0
    
    high_conf = 0
    med_conf = 0
    low_conf = 0

    total_clicks = 0
    total_conv = 0.0
    total_conv_val = 0.0

    for r in records:
        rec = r.get('recommendation')
        if rec == 'PROMOTE':
            promote_count += 1
        elif rec == 'BLOCK':
            block_count += 1
        elif rec == 'IGNORE':
            ignore_count += 1
        elif rec == 'HUMAN REVIEW':
            review_count += 1

        conf_label = r.get('confidence_label')
        if conf_label == 'High':
            high_conf += 1
        elif conf_label == 'Medium':
            med_conf += 1
        else:
            low_conf += 1

        total_clicks += int(r.get('clicks') or 0)
        total_conv += float(r.get('conversions') or 0.0)
        total_conv_val += float(r.get('conversion_value') or 0.0)

    spend_intel = ACTIVE_STATE['spend_intel']

    return jsonify({
        'status': 'success',
        'dataset_name': ACTIVE_STATE['dataset_name'],
        'is_demo': ACTIVE_STATE['is_demo'],
        'total_processed': len(records),
        'total_rejected': len(ACTIVE_STATE['rejected_rows']),
        'decision_counts': {
            'PROMOTE': promote_count,
            'BLOCK': block_count,
            'IGNORE': ignore_count,
            'HUMAN REVIEW': review_count
        },
        'confidence_counts': {
            'High': high_conf,
            'Medium': med_conf,
            'Low': low_conf
        },
        'kpi_metrics': {
            'total_spend': spend_intel.get('total_spend', 0.0),
            'total_clicks': total_clicks,
            'total_conversions': round(total_conv, 1),
            'total_conversion_value': round(total_conv_val, 2),
            'estimated_avoidable_spend': spend_intel.get('estimated_avoidable_spend', 0.0),
            'blocked_spend': spend_intel.get('blocked_spend', 0.0),
            'review_spend': spend_intel.get('review_spend', 0.0)
        },
        'spend_intelligence': spend_intel,
        'recent_audit_logs': get_audit_logs()
    })

@app.route('/api/results', methods=['GET'])
def get_results():
    records = ACTIVE_STATE['records']
    
    # Query parameters for filtering
    search_q = request.args.get('search', '').strip().lower()
    decision_filter = request.args.get('decision', '').strip()
    campaign_filter = request.args.get('campaign', '').strip()
    confidence_filter = request.args.get('confidence', '').strip()
    human_review_only = request.args.get('human_review_only', 'false').lower() == 'true'
    min_spend = request.args.get('min_spend', type=float)
    sort_by = request.args.get('sort_by', 'cost') # cost, conversions, confidence, search_term
    sort_dir = request.args.get('sort_dir', 'desc') # asc, desc
    
    page = request.args.get('page', 1, type=int)
    page_size = request.args.get('page_size', 50, type=int)

    filtered = records

    if search_q:
        filtered = [r for r in filtered if search_q in r.get('search_term', '').lower() or search_q in r.get('ad_group', '').lower()]
    if decision_filter and decision_filter.upper() != 'ALL':
        filtered = [r for r in filtered if r.get('recommendation', '').upper() == decision_filter.upper()]
    if campaign_filter and campaign_filter != 'ALL':
        filtered = [r for r in filtered if r.get('campaign') == campaign_filter]
    if confidence_filter and confidence_filter.upper() != 'ALL':
        filtered = [r for r in filtered if r.get('confidence_label', '').upper() == confidence_filter.upper()]
    if human_review_only:
        filtered = [r for r in filtered if r.get('recommendation') == 'HUMAN REVIEW']
    if min_spend is not None:
        filtered = [r for r in filtered if float(r.get('cost') or 0.0) >= min_spend]

    # Sorting
    reverse = (sort_dir.lower() == 'desc')
    if sort_by == 'cost':
        filtered.sort(key=lambda x: float(x.get('cost') or 0.0), reverse=reverse)
    elif sort_by == 'conversions':
        filtered.sort(key=lambda x: float(x.get('conversions') or 0.0), reverse=reverse)
    elif sort_by == 'clicks':
        filtered.sort(key=lambda x: int(x.get('clicks') or 0), reverse=reverse)
    elif sort_by == 'confidence':
        filtered.sort(key=lambda x: float(x.get('confidence') or 0.0), reverse=reverse)
    elif sort_by == 'search_term':
        filtered.sort(key=lambda x: x.get('search_term', '').lower(), reverse=reverse)

    total_filtered = len(filtered)
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    paginated_results = filtered[start_idx:end_idx]

    # Available campaigns for filter dropdown
    unique_campaigns = sorted(list(set(r.get('campaign', 'General Campaign') for r in records)))

    return jsonify({
        'status': 'success',
        'total': total_filtered,
        'page': page,
        'page_size': page_size,
        'total_pages': max(1, (total_filtered + page_size - 1) // page_size),
        'campaigns': unique_campaigns,
        'results': paginated_results
    })

@app.route('/api/clusters', methods=['GET'])
def get_clusters():
    return jsonify({
        'status': 'success',
        'clusters': ACTIVE_STATE['clusters']
    })

@app.route('/api/review-queue', methods=['GET'])
def get_review_queue():
    queue = [r for r in ACTIVE_STATE['records'] if r.get('recommendation') == 'HUMAN REVIEW' or r.get('confidence_label') == 'Low']
    # Sort queue by cost descending
    queue.sort(key=lambda x: float(x.get('cost') or 0.0), reverse=True)
    return jsonify({
        'status': 'success',
        'count': len(queue),
        'items': queue
    })

@app.route('/api/review', methods=['POST'])
def submit_review():
    data = request.json or {}
    row_id = data.get('row_id')
    new_decision = data.get('decision')
    reason = data.get('reason', '')
    notes = data.get('notes', '')

    if not row_id or not new_decision:
        return jsonify({'status': 'error', 'error': 'row_id and decision are required'}), 400

    # Locate record in active memory
    target_record = None
    for r in ACTIVE_STATE['records']:
        if r.get('row_id') == row_id:
            target_record = r
            break

    if not target_record:
        return jsonify({'status': 'error', 'error': f"Record '{row_id}' not found"}), 404

    # Save to SQLite
    feedback_id = save_feedback(
        row_id=row_id,
        search_term=target_record.get('search_term'),
        campaign=target_record.get('campaign'),
        ad_group=target_record.get('ad_group'),
        original_decision=target_record.get('recommendation'),
        reviewer_decision=new_decision,
        reason=reason,
        notes=notes
    )

    # Update record in memory
    target_record['recommendation'] = new_decision
    target_record['review_status'] = 'Reviewed by Analyst'
    target_record['explanation'] = f"Overridden by analyst to {new_decision}. Reason: {reason or 'Manual review'}."
    target_record['rules_triggered'].append("RULE_REVIEWER_OVERRIDE_APPLIED")

    # If changed to BLOCK, ensure negative keyword is recorded
    if new_decision == 'BLOCK':
        save_negative_keywords([{
            'row_id': row_id,
            'search_term': target_record.get('search_term'),
            'suggested_negative': target_record.get('search_term'),
            'campaign': target_record.get('campaign'),
            'ad_group': target_record.get('ad_group'),
            'match_type': 'Exact',
            'scope': 'Campaign',
            'reason': reason,
            'confidence': target_record.get('confidence', 95.0),
            'status': 'Approved'
        }])

    # Re-calculate spend intelligence
    ACTIVE_STATE['spend_intel'] = analyze_spend_intelligence(ACTIVE_STATE['records'])

    return jsonify({
        'status': 'success',
        'feedback_id': feedback_id,
        'updated_record': target_record
    })

@app.route('/api/feedback', methods=['GET'])
def get_feedback():
    return jsonify({
        'status': 'success',
        'feedback': get_all_feedback()
    })

@app.route('/api/feedback/<int:feedback_id>', methods=['DELETE'])
def delete_feedback(feedback_id):
    delete_feedback_item(feedback_id)
    return jsonify({'status': 'success'})

@app.route('/api/feedback/clear', methods=['POST'])
def clear_feedback():
    clear_all_feedback()
    return jsonify({'status': 'success'})

@app.route('/api/negative-keywords', methods=['GET'])
def get_negative_keywords():
    return jsonify({
        'status': 'success',
        'negative_keywords': get_all_negative_keywords()
    })

@app.route('/api/negative-keywords/update', methods=['POST'])
def update_negative():
    data = request.json or {}
    neg_id = data.get('id')
    updates = data.get('updates', {})
    if not neg_id:
        return jsonify({'status': 'error', 'error': 'id required'}), 400
    update_negative_keyword(neg_id, updates)
    return jsonify({'status': 'success'})

@app.route('/api/spend/simulate', methods=['POST'])
def simulate_spend():
    sim_params = request.json or {}
    res = analyze_spend_intelligence(ACTIVE_STATE['records'], simulation_params=sim_params)
    return jsonify({'status': 'success', 'simulation_results': res})

@app.route('/api/export/results', methods=['GET'])
def export_results_csv():
    csv_str = generate_csv_export(ACTIVE_STATE['records'])
    return Response(
        csv_str,
        mimetype="text/csv",
        headers={"Content-disposition": "attachment; filename=search_term_triage_results.csv"}
    )

@app.route('/api/export/negatives', methods=['GET'])
def export_negatives_csv():
    negs = get_all_negative_keywords()
    csv_str = generate_negatives_csv(negs)
    return Response(
        csv_str,
        mimetype="text/csv",
        headers={"Content-disposition": "attachment; filename=google_ads_negative_keywords.csv"}
    )

@app.route('/api/export/rejected', methods=['GET'])
def export_rejected_csv():
    csv_str = generate_rejected_rows_csv(ACTIVE_STATE['rejected_rows'])
    return Response(
        csv_str,
        mimetype="text/csv",
        headers={"Content-disposition": "attachment; filename=rejected_rows_audit_report.csv"}
    )

@app.route('/api/audit-report', methods=['GET'])
def get_audit_report():
    summary_data = {
        'dataset_name': ACTIVE_STATE['dataset_name'],
        'total_processed': len(ACTIVE_STATE['records']),
        'total_rejected': len(ACTIVE_STATE['rejected_rows']),
        'decision_counts': {
            'PROMOTE': sum(1 for r in ACTIVE_STATE['records'] if r.get('recommendation') == 'PROMOTE'),
            'BLOCK': sum(1 for r in ACTIVE_STATE['records'] if r.get('recommendation') == 'BLOCK'),
            'IGNORE': sum(1 for r in ACTIVE_STATE['records'] if r.get('recommendation') == 'IGNORE'),
            'HUMAN REVIEW': sum(1 for r in ACTIVE_STATE['records'] if r.get('recommendation') == 'HUMAN REVIEW')
        },
        'spend_intelligence': ACTIVE_STATE['spend_intel']
    }
    
    as_html = request.args.get('format', 'json').lower() == 'html'
    if as_html:
        html = generate_executive_audit_report(summary_data)
        return Response(html, mimetype="text/html")
    
    return jsonify({
        'status': 'success',
        'report': summary_data
    })

@app.route('/api/config', methods=['GET', 'POST'])
def manage_config():
    if request.method == 'POST':
        new_cfg = request.json or {}
        ACTIVE_STATE['config'].update(new_cfg)
        set_config_setting('classifier_config', ACTIVE_STATE['config'])
        return jsonify({'status': 'success', 'config': ACTIVE_STATE['config']})
    
    return jsonify({'status': 'success', 'config': ACTIVE_STATE['config']})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='127.0.0.1', port=port, debug=True)
