import json
import os
import sqlite3
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from datetime import datetime
from flask import Blueprint, jsonify, request, current_app, send_from_directory
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from flask_apscheduler import APScheduler

# --- CHATBOT IMPORTS ---
from dotenv import load_dotenv
import google.generativeai as genai
# -------------------------------

from . import db
from .models import Pipeline, User, DataSource, ProcessedFile, SharedPipeline, PipelineRun
from .pipeline_engine import PipelineEngine, get_size_format
from .chatbot_context import get_gemini_response, generate_pipeline_plan 

# Try to import the system prompt, handle error if file missing
try:
    from .chatbot_context import SYSTEM_PROMPT
except ImportError:
    SYSTEM_PROMPT = "You are a helpful assistant for StreamForge."

main = Blueprint('main', __name__)

# --- CONFIGURATION START ---

# 1. Force load .env from the backend root folder
current_dir = os.path.dirname(os.path.abspath(__file__)) # backend/app
backend_root = os.path.dirname(current_dir)              # backend/
env_path = os.path.join(backend_root, '.env')

if os.path.exists(env_path):
    load_dotenv(env_path)
    print(f"✅ Loaded environment variables from: {env_path}")
else:
    print(f"⚠️  WARNING: .env file not found at {env_path}")

# 2. Configure Gemini securely
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    print("✅ Gemini AI Configured Successfully")
else:
    print("❌ ERROR: GEMINI_API_KEY is missing. Chatbot will not work.")

# --- CONFIGURATION END ---


# --- UTILITIES ---
def safe_convert(val):
    try:
        return int(val)
    except (ValueError, TypeError):
        try:
            return float(val)
        except (ValueError, TypeError):
            return val

# --- CORE ROUTES ---

@main.route('/', methods=['GET'])
def home():
    return jsonify({"message": "The Modular ETL Engine is Online!"})

# --- CHATBOT ROUTE ---

@main.route('/chat', methods=['POST'])
def chat_with_ai():
    # Fail fast if no key
    if not GEMINI_API_KEY:
        return jsonify({"reply": "System Error: API Key missing. Please check backend logs."}), 500

    data = request.json
    user_message = data.get('message', '')
    
    if not user_message:
        return jsonify({"error": "Empty message"}), 400

    try:
        # Use the stable Flash model
        model = genai.GenerativeModel('gemini-flash-latest')
        
        full_prompt = f"{SYSTEM_PROMPT}\n\nUser Question: {user_message}"
        response = model.generate_content(full_prompt)
        
        return jsonify({"reply": response.text})
        
    except Exception as e:
        print(f"AI Error: {str(e)}")
        # Check for specific quota error
        if "429" in str(e):
             return jsonify({"reply": "I'm receiving too many requests right now. Please try again in a minute."}), 429
        return jsonify({"reply": "I'm having trouble connecting to my brain right now. Please check the server logs."}), 500


# --- AUTH ROUTES ---

@main.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"error": "Email already exists"}), 400
    
    hashed_password = generate_password_hash(data['password'])
    
    new_user = User(username=data['fullName'], email=data['email'], password_hash=hashed_password)
    
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User created successfully!"}), 201

@main.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        user = User.query.filter_by(email=data['email']).first()
        
        if not user or user.is_suspended:
            return jsonify({"error": "Invalid credentials or account suspended"}), 401
            
        if not check_password_hash(user.password_hash, data['password']):
            return jsonify({"error": "Invalid credentials"}), 401
        
        access_token = create_access_token(identity=str(user.id))
        return jsonify({
            "message": "Login successful!", 
            "token": access_token, 
            "user": {
                "id": user.id, 
                "username": user.username,
                "email": user.email,
                "is_admin": user.is_admin 
            }
        })
    except Exception as e:
        return jsonify({"error": "Server error"}), 500

# --- USER SETTINGS ROUTES ---

@main.route('/user/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    data = request.get_json()
    
    if 'username' in data: user.username = data['username']
    if 'email' in data and data['email'] != user.email:
        if User.query.filter_by(email=data['email']).first():
            return jsonify({"error": "Email already in use"}), 400
        user.email = data['email']

    db.session.commit()
    return jsonify({"message": "Profile updated", "user": {"id": user.id, "username": user.username, "email": user.email, "is_admin": user.is_admin}})

@main.route('/user/password', methods=['PUT'])
@jwt_required()
def change_password():
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    data = request.get_json()
    
    if not check_password_hash(user.password_hash, data.get('currentPassword')):
        return jsonify({"error": "Incorrect current password"}), 401
        
    user.password_hash = generate_password_hash(data.get('newPassword'))
    db.session.commit()
    return jsonify({"message": "Password changed successfully"})

@main.route('/user/account', methods=['DELETE'])
@jwt_required()
def delete_account():
    try:
        current_user_id = int(get_jwt_identity())
        user = User.query.get(current_user_id)
        
        Pipeline.query.filter_by(user_id=current_user_id).delete()
        DataSource.query.filter_by(user_id=current_user_id).delete()
        ProcessedFile.query.filter_by(user_id=current_user_id).delete()
        
        db.session.delete(user)
        db.session.commit()
        return jsonify({"message": "Account deleted successfully"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# --- COLLABORATION ROUTES ---

@main.route('/collaboration/stats', methods=['GET'])
@jwt_required()
def get_collab_stats():
    current_user_id = int(get_jwt_identity())
    
    shared_with_me = SharedPipeline.query.filter_by(user_id=current_user_id).count()
    
    my_shared = db.session.query(SharedPipeline.pipeline_id)\
        .join(Pipeline)\
        .filter(Pipeline.user_id == current_user_id)\
        .distinct().count()
    
    # Simple team calculation
    sharers = db.session.query(Pipeline.user_id)\
        .join(SharedPipeline, Pipeline.id == SharedPipeline.pipeline_id)\
        .filter(SharedPipeline.user_id == current_user_id)
    recipients = db.session.query(SharedPipeline.user_id)\
        .join(Pipeline, Pipeline.id == SharedPipeline.pipeline_id)\
        .filter(Pipeline.user_id == current_user_id)
    team_members = sharers.union(recipients).distinct().count()

    return jsonify({
        "shared_with_me": shared_with_me,
        "my_shared_pipelines": my_shared,
        "team_members": team_members
    })

@main.route('/collaboration/shared-with-me', methods=['GET'])
@jwt_required()
def get_shared_with_me():
    current_user_id = int(get_jwt_identity())
    shares = SharedPipeline.query.filter_by(user_id=current_user_id).all()
    output = []
    for share in shares:
        p = share.pipeline
        if not p: continue 
        output.append({
            "id": p.id,
            "name": p.name,
            "owner_name": p.owner.username,
            "owner_email": p.owner.email,
            "role": share.role,
            "updated_at": p.created_at.strftime('%Y-%m-%d %H:%M'), 
            "version": "1.0",
            "share_id": share.id
        })
    return jsonify(output)

@main.route('/collaboration/shared-by-me', methods=['GET'])
@jwt_required()
def get_shared_by_me():
    current_user_id = int(get_jwt_identity())
    pipelines = Pipeline.query.filter_by(user_id=current_user_id).all()
    output = []
    for p in pipelines:
        if p.shares.count() > 0:
            shared_users = []
            for s in p.shares:
                shared_users.append({
                    "share_id": s.id,
                    "username": s.recipient.username if hasattr(s, 'recipient') else "Unknown", 
                    "email": s.recipient.email if hasattr(s, 'recipient') else "Unknown",
                    "role": s.role
                })
            output.append({
                "id": p.id,
                "name": p.name,
                "status": p.status,
                "shared_users": shared_users,
                "user_count": len(shared_users)
            })
    return jsonify(output)

@main.route('/pipelines/share', methods=['POST'])
@jwt_required()
def share_pipeline():
    current_user_id = int(get_jwt_identity())
    data = request.get_json()
    
    pipeline_id = data.get('pipeline_id')
    email = data.get('email')
    role = data.get('role', 'viewer')
    
    pipeline = Pipeline.query.filter_by(id=pipeline_id, user_id=current_user_id).first()
    if not pipeline:
        return jsonify({"error": "Pipeline not found or you are not the owner"}), 404
        
    recipient = User.query.filter_by(email=email).first()
    if not recipient:
        return jsonify({"error": "User with this email not found"}), 404
        
    if recipient.id == current_user_id:
        return jsonify({"error": "Cannot share with yourself"}), 400
        
    existing = SharedPipeline.query.filter_by(pipeline_id=pipeline.id, user_id=recipient.id).first()
    if existing:
        return jsonify({"error": "Pipeline already shared with this user"}), 400
        
    new_share = SharedPipeline(pipeline_id=pipeline.id, user_id=recipient.id, role=role)
    db.session.add(new_share)
    db.session.commit()
    
    return jsonify({"message": f"Pipeline shared with {recipient.username}"})

@main.route('/pipelines/share/<int:share_id>', methods=['DELETE'])
@jwt_required()
def revoke_share(share_id):
    current_user_id = int(get_jwt_identity())
    share = SharedPipeline.query.get(share_id)
    if not share:
        return jsonify({"error": "Share record not found"}), 404
    
    if share.pipeline.user_id == current_user_id or share.user_id == current_user_id:
        db.session.delete(share)
        db.session.commit()
        return jsonify({"message": "Access revoked"})
    
    return jsonify({"error": "Unauthorized"}), 403

# --- ADMIN ROUTES ---

@main.route('/admin/users', methods=['GET'])
@jwt_required()
def get_all_users():
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    if not user or not user.is_admin: return jsonify({"error": "Unauthorized"}), 403
    
    all_users = User.query.all()
    return jsonify([{
        "id": u.id, "username": u.username, "email": u.email, 
        "is_admin": u.is_admin, "is_suspended": u.is_suspended,
        "pipelines_count": u.pipelines.count(),
        "processed_bytes": get_size_format(u.total_processed_bytes)
    } for u in all_users])

@main.route('/admin/users/<int:user_id>/suspend', methods=['PUT'])
@jwt_required()
def suspend_user(user_id):
    current_user_id = int(get_jwt_identity())
    admin = User.query.get(current_user_id)
    if not admin or not admin.is_admin: return jsonify({"error": "Unauthorized"}), 403

    user_to_mod = User.query.get(user_id)
    if not user_to_mod: return jsonify({"error": "User not found"}), 404
    if user_to_mod.id == admin.id: return jsonify({"error": "Cannot suspend yourself"}), 400

    data = request.get_json()
    user_to_mod.is_suspended = data.get('is_suspended', True)
    db.session.commit()
    return jsonify({"message": f"User {'suspended' if user_to_mod.is_suspended else 'activated'}"})

@main.route('/admin/stats', methods=['GET'])
@jwt_required()
def get_admin_stats():
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    if not user or not user.is_admin: return jsonify({"error": "Unauthorized"}), 403

    total_users = User.query.count()
    total_pipelines = Pipeline.query.count()
    active_pipelines = Pipeline.query.filter_by(status='Active').count()
    global_bytes = sum(u.total_processed_bytes for u in User.query.all())

    recent_users = []
    for u in User.query.order_by(User.id.desc()).limit(5).all():
        recent_users.append({"id": u.id, "username": u.username, "email": u.email})

    return jsonify({
        "total_users": total_users,
        "total_pipelines": total_pipelines,
        "active_pipelines": active_pipelines,
        "total_processed_bytes": global_bytes,
        "recent_users": recent_users
    })

@main.route('/user-stats', methods=['GET'])
@jwt_required()
def get_user_stats():
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    return jsonify({"total_processed_bytes": user.total_processed_bytes, "username": user.username})

# --- PIPELINE ROUTES ---

@main.route('/pipelines', methods=['POST'])
@jwt_required()
def create_pipeline():
    current_user_id = int(get_jwt_identity())
    data = request.get_json()
    new_pipeline = Pipeline(name=data.get('name', 'Untitled'), structure=json.dumps(data.get('flow')), user_id=current_user_id)
    db.session.add(new_pipeline)
    db.session.commit()
    return jsonify({"message": "Pipeline Created!", "id": new_pipeline.id})

@main.route('/pipelines', methods=['GET'])
@jwt_required()
def get_pipelines():
    current_user_id = int(get_jwt_identity())
    pipelines = Pipeline.query.filter_by(user_id=current_user_id).all()
    
    output = []
    for p in pipelines:
        output.append({
            "id": p.id, "name": p.name, "flow": json.loads(p.structure), 
            "status": p.status, "created_at": p.created_at.strftime('%Y-%m-%d %H:%M'),
            "is_shared": False, "permission": "owner"
        })
        
    shares = SharedPipeline.query.filter_by(user_id=current_user_id).all()
    for share in shares:
        p = share.pipeline
        if not p: continue 
        output.append({
            "id": p.id, "name": f"{p.name} (Shared)", "flow": json.loads(p.structure),
            "status": p.status, "created_at": p.created_at.strftime('%Y-%m-%d %H:%M'),
            "is_shared": True, "permission": share.role, "owner": p.owner.username
        })
        
    return jsonify(output)

@main.route('/pipelines/<int:id>', methods=['GET'])
@jwt_required()
def get_pipeline(id):
    current_user_id = int(get_jwt_identity())
    pipeline = Pipeline.query.filter_by(id=id, user_id=current_user_id).first()
    
    if not pipeline:
        share = SharedPipeline.query.filter_by(pipeline_id=id, user_id=current_user_id).first()
        if share: pipeline = share.pipeline
            
    if not pipeline: return jsonify({"error": "Not found"}), 404
    return jsonify({"id": pipeline.id, "name": pipeline.name, "flow": json.loads(pipeline.structure), "status": pipeline.status})

@main.route('/pipelines/<int:id>', methods=['PUT'])
@jwt_required()
def update_pipeline(id):
    current_user_id = int(get_jwt_identity())
    pipeline = Pipeline.query.filter_by(id=id, user_id=current_user_id).first()
    
    if not pipeline:
        share = SharedPipeline.query.filter_by(pipeline_id=id, user_id=current_user_id).first()
        if share and share.role == 'editor': pipeline = share.pipeline
    
    if not pipeline: return jsonify({"error": "Not found or read-only"}), 404
    
    data = request.get_json()
    pipeline.name = data.get('name', pipeline.name)
    pipeline.structure = json.dumps(data.get('flow'))
    db.session.commit()
    return jsonify({"message": "Updated"})

@main.route('/pipelines/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_pipeline(id):
    current_user_id = int(get_jwt_identity())
    pipeline = Pipeline.query.filter_by(id=id, user_id=current_user_id).first()
    if not pipeline: return jsonify({"error": "Not found"}), 404
    db.session.delete(pipeline)
    db.session.commit()
    return jsonify({"message": "Deleted"})

@main.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    history = data.get('history', [])
    message = data.get('message', '')
    response_text = get_gemini_response(history, message)
    return jsonify({'response': response_text})

@main.route('/api/generate_pipeline', methods=['POST'])
def generate_pipeline():
    data = request.json
    prompt = data.get('prompt')
    
    if not prompt:
        return jsonify({"error": "No prompt provided"}), 400

    print(f"Generating pipeline for prompt: {prompt}") 

    ai_plan = generate_pipeline_plan(prompt)
    
    if "error" in ai_plan:
        return jsonify(ai_plan), 500
        
    return jsonify(ai_plan)

# --- NEW DATA CATALOG & LINEAGE ROUTES ---

@main.route('/api/catalog/search', methods=['GET'])
@jwt_required()
def catalog_search():
    current_user_id = int(get_jwt_identity())
    query = request.args.get('q', '').lower()
    
    # Search DataSources
    raw_files = DataSource.query.filter_by(user_id=current_user_id).all()
    # Search ProcessedFiles
    proc_files = ProcessedFile.query.filter_by(user_id=current_user_id).all()
    
    results = []
    
    # Helper to check match
    def check_match(file_obj, ftype):
        match_found = False
        match_reason = []
        
        # 1. Filename match
        if query in file_obj.filename.lower():
            match_found = True
            match_reason.append("Filename")
            
        # 2. Column match
        cols = {}
        if file_obj.columns:
            try:
                cols = json.loads(file_obj.columns)
                for c_name in cols.keys():
                    if query in c_name.lower():
                        match_found = True
                        match_reason.append(f"Column: {c_name}")
            except: pass
            
        if match_found:
            results.append({
                "id": file_obj.id,
                "name": file_obj.filename,
                "type": ftype, # 'Source' or 'Processed'
                "rows": file_obj.row_count,
                "columns": cols,
                "matches": match_reason[:3] # Top 3 reasons
            })

    for f in raw_files: check_match(f, 'Source')
    for f in proc_files: check_match(f, 'Processed')
    
    return jsonify(results)

@main.route('/api/catalog/lineage/<string:ftype>/<int:fid>', methods=['GET'])
@jwt_required()
def get_lineage(ftype, fid):
    current_user_id = int(get_jwt_identity())
    
    lineage_data = {
        "used_in": [],      # Forward lineage (Impact)
        "created_by": None  # Backward lineage (Provenance)
    }
    
    # 1. Backward Lineage (Where did this file come from?)
    target_filename = ""
    if ftype == 'Processed':
        f = ProcessedFile.query.get(fid)
        if f and f.source_pipeline:
            lineage_data['created_by'] = {
                "id": f.source_pipeline.id,
                "name": f.source_pipeline.name
            }
        target_filename = f.filename if f else ""
    elif ftype == 'Source':
        f = DataSource.query.get(fid)
        lineage_data['created_by'] = {"name": "User Upload"}
        target_filename = f.filename if f else ""

    # 2. Forward Lineage (Where is this file used?)
    # We must scan pipeline structures. In a production system, we'd have a 'PipelineDependency' table.
    if target_filename:
        all_pipelines = Pipeline.query.filter_by(user_id=current_user_id).all()
        for p in all_pipelines:
            try:
                structure = json.loads(p.structure)
                # Check nodes for sources matching this filename
                for node in structure:
                    if node['type'].startswith('source_'):
                        # Loose matching by filename (since pipelines reference filenames, not IDs currently)
                        p_file = node['data'].get('filename') or node['data'].get('label')
                        if p_file == target_filename:
                            lineage_data['used_in'].append({
                                "id": p.id,
                                "name": p.name
                            })
                            break
            except:
                continue

    return jsonify(lineage_data)


# --- UPDATED UPLOAD ROUTE (Auto-Index Schema) ---

@main.route('/upload', methods=['POST'])
@jwt_required()
def upload_file():
    current_user_id = int(get_jwt_identity())
    
    if 'file' not in request.files: return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    if file.filename == '': return jsonify({"error": "No selected file"}), 400

    if file:
        filename = secure_filename(file.filename)
        base_dir = os.path.abspath(os.path.dirname(__file__))
        upload_folder = os.path.join(base_dir, '..', 'uploads')
        if not os.path.exists(upload_folder): os.makedirs(upload_folder)
            
        file_path = os.path.join(upload_folder, filename)
        file.save(file_path)
        
        file_size = os.path.getsize(file_path)
        formatted_size = get_size_format(file_size)
        file_ext = filename.rsplit('.', 1)[1].upper() if '.' in filename else 'UNKNOWN'

        # --- EXTRACT METADATA ---
        row_count = 0
        columns_json = "{}"
        try:
            df = None
            if filename.lower().endswith('.csv'):
                # Read just header and a few rows for schema
                df = pd.read_csv(file_path, nrows=5) 
                # Helper for quick row count
                with open(file_path) as f:
                    row_count = sum(1 for line in f) - 1 
            elif filename.lower().endswith('.json'):
                df = pd.read_json(file_path)
                row_count = len(df)
            elif filename.lower().endswith(('.xls', '.xlsx')):
                df = pd.read_excel(file_path)
                row_count = len(df)
            
            if df is not None:
                col_map = {col: str(dtype) for col, dtype in df.dtypes.items()}
                columns_json = json.dumps(col_map)
        except Exception as e:
            print(f"Metadata extraction failed: {e}")

        new_source = DataSource(
            filename=filename, file_type=file_ext, file_size=formatted_size,
            filepath=file_path, user_id=current_user_id,
            # NEW FIELDS
            row_count=row_count, columns=columns_json
        )
        db.session.add(new_source)
        db.session.commit()
        return jsonify({"message": "File uploaded successfully", "id": new_source.id}), 201

@main.route('/datasources', methods=['GET'])
@jwt_required()
def get_datasources():
    current_user_id = int(get_jwt_identity())
    sources = DataSource.query.filter_by(user_id=current_user_id).all()
    return jsonify([{"id": s.id, "name": s.filename, "size": s.file_size, "type": s.file_type, "date": s.upload_date.strftime("%Y-%m-%d")} for s in sources])

@main.route('/datasources/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_datasource(id):
    current_user_id = int(get_jwt_identity())
    source = DataSource.query.filter_by(id=id, user_id=current_user_id).first()
    if not source: return jsonify({"error": "File not found"}), 404

    if os.path.exists(source.filepath): os.remove(source.filepath)
    db.session.delete(source)
    db.session.commit()
    return jsonify({"message": "File removed successfully!"})

@main.route('/processed-files', methods=['GET'])
@jwt_required()
def get_processed_files():
    current_user_id = int(get_jwt_identity())
    files = ProcessedFile.query.filter_by(user_id=current_user_id).order_by(ProcessedFile.created_at.desc()).all()
    return jsonify([{"id": f.id, "name": f.filename, "type": f.file_type, "size": f.file_size_display, "size_bytes": f.file_size_bytes, "date": f.created_at.strftime('%Y-%m-%d %H:%M')} for f in files])

@main.route('/download/processed/<path:filename>', methods=['GET'])
def download_processed_file(filename):
    base_dir = os.path.abspath(os.path.dirname(__file__))
    processed_dir = os.path.join(base_dir, '..', 'processed')
    return send_from_directory(processed_dir, filename, as_attachment=True)

@main.route('/processed-files/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_processed_file(id):
    current_user_id = int(get_jwt_identity())
    file_entry = ProcessedFile.query.filter_by(id=id, user_id=current_user_id).first()
    if not file_entry: return jsonify({"error": "File not found"}), 404

    if os.path.exists(file_entry.filepath): os.remove(file_entry.filepath)
    db.session.delete(file_entry)
    db.session.commit()
    return jsonify({"message": "File deleted"})

@main.route('/pipelines/<int:id>/schedule', methods=['POST'])
@jwt_required()
def set_schedule(id):
    current_user_id = int(get_jwt_identity())
    pipeline = Pipeline.query.filter_by(id=id, user_id=current_user_id).first()
    if not pipeline: return jsonify({"error": "Pipeline not found"}), 404

    data = request.json
    cron_type = data.get('type') # 'interval' or 'cron'
    value = data.get('value')    # '30' (minutes) or '0 9 * * *'

    # 1. Remove existing job if any
    from run import scheduler, run_scheduled_job 
    try:
        scheduler.remove_job(f"pipeline_{id}")
    except:
        pass 

    # 2. If turning off
    if not value:
        pipeline.schedule = None
        db.session.commit()
        return jsonify({"message": "Schedule removed"})

    # 3. Add new job
    if cron_type == 'interval':
        minutes = int(value)
        scheduler.add_job(
            id=f"pipeline_{id}",
            func=run_scheduled_job,
            args=[id],
            trigger='interval',
            minutes=minutes
        )
    elif cron_type == 'cron':
        hour, minute = value.split(':')
        scheduler.add_job(
            id=f"pipeline_{id}",
            func=run_scheduled_job,
            args=[id],
            trigger='cron',
            hour=int(hour),
            minute=int(minute)
        )

    pipeline.schedule = f"{cron_type}:{value}"
    db.session.commit()
    
    return jsonify({"message": f"Pipeline scheduled ({cron_type}: {value})"})

# --- EXECUTION ---

@main.route('/run-pipeline', methods=['POST'])
@jwt_required()
def run_pipeline():
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    req_data = request.json
    pipeline_id = req_data.get('pipelineId')

    run_record = None
    pipeline_entry = None
    
    if pipeline_id:
        pipeline_entry = Pipeline.query.get(pipeline_id)
        if pipeline_entry:
            pipeline_entry.status = 'Active'
            run_record = PipelineRun(
                pipeline_id=pipeline_id,
                status='Running',
                start_time=datetime.utcnow(),
                logs=json.dumps(["Initializing pipeline..."])
            )
            db.session.add(run_record)
            db.session.commit()

    engine = None
    try:
        base_dir = os.path.abspath(os.path.dirname(__file__))
        engine = PipelineEngine(
            nodes=req_data.get('nodes', []),
            edges=req_data.get('edges', []),
            user=user,
            base_dir=base_dir,
            db_session=db.session,
            pipeline_id=pipeline_id # NEW: Pass ID for lineage
        )
        
        logs = engine.run()
        
        if run_record:
            run_record.status = 'Success'
            run_record.end_time = datetime.utcnow()
            run_record.logs = json.dumps(logs)
            if pipeline_entry: pipeline_entry.status = 'Ready'
            db.session.commit()
        
        return jsonify({"message": "Pipeline Executed Successfully", "logs": logs})

    except Exception as e:
        if run_record:
            run_record.status = 'Failed'
            run_record.end_time = datetime.utcnow()
            current_logs = engine.logs if engine else ["Pipeline failed before engine init."]
            current_logs.append(f"CRITICAL ERROR: {str(e)}")
            run_record.logs = json.dumps(current_logs)
            if pipeline_entry: pipeline_entry.status = 'Ready'
            db.session.commit()
            
        return jsonify({"error": str(e)}), 500

@main.route('/preview-node', methods=['POST'])
@jwt_required()
def preview_node():
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    req_data = request.json
    
    target_node_id = req_data.get('targetNodeId')
    nodes = req_data.get('nodes', [])
    edges = req_data.get('edges', [])
    
    if not target_node_id:
        return jsonify({"error": "Target node ID required"}), 400

    try:
        base_dir = os.path.abspath(os.path.dirname(__file__))
        engine = PipelineEngine(
            nodes=nodes,
            edges=edges,
            user=user,
            base_dir=base_dir,
            db_session=db.session,
            preview_mode=True 
        )
        
        result = engine.run_preview(target_node_id)
        if "error" in result: return jsonify(result), 400
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@main.route('/processed-files/<int:id>/preview', methods=['GET'])
@jwt_required()
def preview_processed_file(id):
    current_user_id = int(get_jwt_identity())
    file_entry = ProcessedFile.query.filter_by(id=id, user_id=current_user_id).first()
    
    if not file_entry: 
        return jsonify({"error": "File not found"}), 404

    if not os.path.exists(file_entry.filepath):
        return jsonify({"error": "File missing from server"}), 404

    try:
        df = None
        if file_entry.filename.lower().endswith('.csv'):
            df = pd.read_csv(file_entry.filepath, nrows=100)
        elif file_entry.filename.lower().endswith('.json'):
            df = pd.read_json(file_entry.filepath)
            df = df.head(100)
        elif file_entry.filename.lower().endswith(('.xls', '.xlsx')):
             df = pd.read_excel(file_entry.filepath, nrows=100)
        
        if df is not None:
             records = df.where(pd.notnull(df), None).to_dict(orient='records')
             return jsonify({
                 "columns": list(df.columns), 
                 "data": records,
                 "filename": file_entry.filename
             })
        else:
             return jsonify({"error": "Preview not supported for this file type"}), 400

    except Exception as e:
        return jsonify({"error": f"Failed to read file: {str(e)}"}), 500

@main.route('/pipelines/<int:id>/history', methods=['GET'])
@jwt_required()
def get_pipeline_history(id):
    current_user_id = int(get_jwt_identity())
    
    pipeline = Pipeline.query.filter_by(id=id, user_id=current_user_id).first()
    if not pipeline:
        share = SharedPipeline.query.filter_by(pipeline_id=id, user_id=current_user_id).first()
        if not share: return jsonify({"error": "Pipeline not found"}), 404

    runs = PipelineRun.query.filter_by(pipeline_id=id).order_by(PipelineRun.start_time.desc()).all()
    
    output = []
    for r in runs:
        duration = "N/A"
        if r.end_time and r.start_time:
            diff = r.end_time - r.start_time
            duration = f"{diff.total_seconds():.2f}s"

        output.append({
            "id": r.id,
            "status": r.status,
            "start_time": r.start_time.strftime('%Y-%m-%d %H:%M:%S'),
            "duration": duration,
            "logs": json.loads(r.logs) if r.logs else []
        })
        
    return jsonify(output)