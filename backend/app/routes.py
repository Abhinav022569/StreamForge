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
from dotenv import load_dotenv
import google.generativeai as genai

# Import global extensions and the jobs module
from . import db, socketio, scheduler
from . import jobs 
from .models import Pipeline, User, DataSource, ProcessedFile, SharedPipeline, PipelineRun, Notification
from .pipeline_engine import PipelineEngine, get_size_format
from .chatbot_context import get_gemini_response, generate_pipeline_plan 

try:
    from .chatbot_context import SYSTEM_PROMPT
except ImportError:
    SYSTEM_PROMPT = "You are a helpful assistant for StreamForge."

main = Blueprint('main', __name__)

current_dir = os.path.dirname(os.path.abspath(__file__)) 
backend_root = os.path.dirname(current_dir)              
env_path = os.path.join(backend_root, '.env')

if os.path.exists(env_path):
    load_dotenv(env_path)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

def safe_convert(val):
    try:
        return int(val)
    except (ValueError, TypeError):
        try:
            return float(val)
        except (ValueError, TypeError):
            return val

@main.route('/', methods=['GET'])
def home():
    return jsonify({"message": "The Modular ETL Engine is Online!"})

# --- CHAT & AUTH ---

@main.route('/chat', methods=['POST'])
def chat_with_ai():
    if not GEMINI_API_KEY:
        return jsonify({"reply": "System Error: API Key missing."}), 500
    data = request.json
    user_message = data.get('message', '')
    if not user_message: return jsonify({"error": "Empty message"}), 400
    try:
        model = genai.GenerativeModel('gemini-flash-latest')
        full_prompt = f"{SYSTEM_PROMPT}\n\nUser Question: {user_message}"
        response = model.generate_content(full_prompt)
        return jsonify({"reply": response.text})
    except Exception as e:
        return jsonify({"reply": "I'm having trouble connecting to my brain right now."}), 500

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
        return jsonify({"message": "Login successful!", "token": access_token, "user": {"id": user.id, "username": user.username, "email": user.email, "is_admin": user.is_admin }})
    except Exception as e:
        return jsonify({"error": "Server error"}), 500

@main.route('/user/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    data = request.get_json()
    if 'username' in data: user.username = data['username']
    if 'email' in data and data['email'] != user.email:
        if User.query.filter_by(email=data['email']).first(): return jsonify({"error": "Email already in use"}), 400
        user.email = data['email']
    db.session.commit()
    return jsonify({"message": "Profile updated", "user": {"id": user.id, "username": user.username, "email": user.email, "is_admin": user.is_admin}})

@main.route('/user/password', methods=['PUT'])
@jwt_required()
def change_password():
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    data = request.get_json()
    if not check_password_hash(user.password_hash, data.get('currentPassword')): return jsonify({"error": "Incorrect current password"}), 401
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
        Notification.query.filter_by(user_id=current_user_id).delete()
        db.session.delete(user)
        db.session.commit()
        return jsonify({"message": "Account deleted successfully"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# --- NOTIFICATION ROUTES ---

@main.route('/api/notifications', methods=['GET'])
@jwt_required()
def get_notifications():
    current_user_id = int(get_jwt_identity())
    try:
        notifs = Notification.query.filter_by(user_id=current_user_id).order_by(Notification.timestamp.desc()).limit(50).all()
        return jsonify([{
            "id": n.id, "message": n.message, "type": n.type, "read": n.read, 
            "timestamp": n.timestamp.isoformat()
        } for n in notifs])
    except Exception as e:
        print(f"Error fetching notifications (DB likely missing table): {e}")
        return jsonify([]), 200

@main.route('/api/notifications/read', methods=['PUT'])
@jwt_required()
def mark_notifications_read():
    current_user_id = int(get_jwt_identity())
    try:
        Notification.query.filter_by(user_id=current_user_id, read=False).update({Notification.read: True})
        db.session.commit()
        return jsonify({"message": "Marked all as read"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@main.route('/api/notifications/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_notification(id):
    current_user_id = int(get_jwt_identity())
    notif = Notification.query.filter_by(id=id, user_id=current_user_id).first()
    if not notif: return jsonify({"error": "Notification not found"}), 404
    try:
        db.session.delete(notif)
        db.session.commit()
        return jsonify({"message": "Notification deleted"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@main.route('/api/user/settings', methods=['GET', 'PUT'])
@jwt_required()
def user_settings():
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    if request.method == 'GET':
        return jsonify({
            "user": { "username": user.username, "email": user.email },
            "preferences": {
                "notify_on_success": user.notify_on_success,
                "notify_on_failure": user.notify_on_failure
            }
        })
    data = request.json
    if 'user' in data:
        if 'username' in data['user']: user.username = data['user']['username']
        if 'email' in data['user']: user.email = data['user']['email']
    if 'preferences' in data:
        prefs = data['preferences']
        user.notify_on_success = prefs.get('notify_on_success', True)
        user.notify_on_failure = prefs.get('notify_on_failure', True)
    db.session.commit()
    return jsonify({"message": "Settings updated"})

# --- ADMIN COMMUNICATION ROUTES ---

@main.route('/admin/broadcast', methods=['POST'])
@jwt_required()
def admin_broadcast():
    try:
        current_user_id = int(get_jwt_identity())
        user = User.query.get(current_user_id)
        if not user or not user.is_admin:
            return jsonify({"error": "Unauthorized"}), 403
        
        data = request.get_json()
        message = data.get('message')
        notif_type = data.get('type', 'info') 
        
        if not message:
            return jsonify({"error": "Message is required"}), 400

        all_users = User.query.all()
        count = 0
        
        for u in all_users:
            new_notif = Notification(user_id=u.id, message=message, type=notif_type)
            db.session.add(new_notif)
            count += 1
            
            try:
                socketio.emit('notification', {
                    'type': notif_type,
                    'message': message
                }, room=f"user_{u.id}")
            except Exception as e:
                print(f"Socket emit failed: {e}")

        db.session.commit()
        return jsonify({"message": f"Broadcast sent to {count} users"})
    
    except Exception as e:
        db.session.rollback()
        print(f"BROADCAST ERROR: {str(e)}")
        return jsonify({"error": str(e)}), 500

@main.route('/admin/email', methods=['POST'])
@jwt_required()
def admin_send_email():
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    if not user or not user.is_admin:
        return jsonify({"error": "Unauthorized"}), 403
        
    data = request.get_json()
    subject = data.get('subject')
    body = data.get('body')
    
    if not subject or not body:
        return jsonify({"error": "Subject and Body required"}), 400
        
    print(f"--- EMAIL BLAST ---\nSubject: {subject}\nBody: {body}\n-------------------")
    return jsonify({"message": "Email blast queued successfully (Stub Mode)"})

# --- PIPELINE & DATA ROUTES ---

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
            pipeline_id=pipeline_id 
        )
        
        logs = engine.run()
        
        if run_record:
            run_record.status = 'Success'
            run_record.end_time = datetime.utcnow()
            run_record.logs = json.dumps(logs)
            if pipeline_entry: pipeline_entry.status = 'Ready'
            
            if user.notify_on_success:
                msg = f"Pipeline '{pipeline_entry.name}' completed successfully."
                try:
                    notif = Notification(user_id=user.id, message=msg, type='success')
                    db.session.add(notif)
                    socketio.emit('notification', {'type': 'success', 'message': msg}, room=f"user_{user.id}")
                except Exception as e:
                    print(f"Notif Error: {e}")

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
            
            if user.notify_on_failure and pipeline_entry:
                msg = f"Pipeline '{pipeline_entry.name}' failed: {str(e)}"
                try:
                    notif = Notification(user_id=user.id, message=msg, type='error')
                    db.session.add(notif)
                    socketio.emit('notification', {'type': 'error', 'message': msg}, room=f"user_{user.id}")
                except Exception as e:
                    print(f"Notif Error: {e}")

            db.session.commit()
            
        return jsonify({"error": str(e)}), 500

@main.route('/collaboration/stats', methods=['GET'])
@jwt_required()
def get_collab_stats():
    current_user_id = int(get_jwt_identity())
    shared_with_me = SharedPipeline.query.filter_by(user_id=current_user_id).count()
    my_shared = db.session.query(SharedPipeline.pipeline_id).join(Pipeline).filter(Pipeline.user_id == current_user_id).distinct().count()
    sharers = db.session.query(Pipeline.user_id).join(SharedPipeline, Pipeline.id == SharedPipeline.pipeline_id).filter(SharedPipeline.user_id == current_user_id)
    recipients = db.session.query(SharedPipeline.user_id).join(Pipeline, Pipeline.id == SharedPipeline.pipeline_id).filter(Pipeline.user_id == current_user_id)
    team_members = sharers.union(recipients).distinct().count()
    return jsonify({"shared_with_me": shared_with_me, "my_shared_pipelines": my_shared, "team_members": team_members})

@main.route('/collaboration/shared-with-me', methods=['GET'])
@jwt_required()
def get_shared_with_me():
    current_user_id = int(get_jwt_identity())
    shares = SharedPipeline.query.filter_by(user_id=current_user_id).all()
    output = []
    for share in shares:
        p = share.pipeline
        if not p: continue 
        output.append({"id": p.id, "name": p.name, "owner_name": p.owner.username, "owner_email": p.owner.email, "role": share.role, "updated_at": p.created_at.strftime('%Y-%m-%d %H:%M'), "version": "1.0", "share_id": share.id})
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
                shared_users.append({"share_id": s.id, "username": s.recipient.username if hasattr(s, 'recipient') else "Unknown", "email": s.recipient.email if hasattr(s, 'recipient') else "Unknown", "role": s.role})
            output.append({"id": p.id, "name": p.name, "status": p.status, "shared_users": shared_users, "user_count": len(shared_users)})
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
    if not pipeline: return jsonify({"error": "Pipeline not found"}), 404
    recipient = User.query.filter_by(email=email).first()
    if not recipient: return jsonify({"error": "User not found"}), 404
    if recipient.id == current_user_id: return jsonify({"error": "Cannot share with yourself"}), 400
    existing = SharedPipeline.query.filter_by(pipeline_id=pipeline.id, user_id=recipient.id).first()
    if existing: return jsonify({"error": "Pipeline already shared"}), 400
    new_share = SharedPipeline(pipeline_id=pipeline.id, user_id=recipient.id, role=role)
    db.session.add(new_share)
    db.session.commit()
    return jsonify({"message": f"Pipeline shared with {recipient.username}"})

@main.route('/pipelines/share/<int:share_id>', methods=['DELETE'])
@jwt_required()
def revoke_share(share_id):
    current_user_id = int(get_jwt_identity())
    share = SharedPipeline.query.get(share_id)
    if not share: return jsonify({"error": "Share not found"}), 404
    if share.pipeline.user_id == current_user_id or share.user_id == current_user_id:
        db.session.delete(share)
        db.session.commit()
        return jsonify({"message": "Access revoked"})
    return jsonify({"error": "Unauthorized"}), 403

@main.route('/admin/users', methods=['GET'])
@jwt_required()
def get_admin_users(): 
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    if not user or not user.is_admin: return jsonify({"error": "Unauthorized"}), 403
    all_users = User.query.all()
    return jsonify([{"id": u.id, "username": u.username, "email": u.email, "is_admin": u.is_admin, "is_suspended": u.is_suspended, "pipelines_count": u.pipelines.count(), "processed_bytes": get_size_format(u.total_processed_bytes)} for u in all_users])

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
    return jsonify({"total_users": total_users, "total_pipelines": total_pipelines, "active_pipelines": active_pipelines, "total_processed_bytes": global_bytes, "recent_users": recent_users})

@main.route('/user-stats', methods=['GET'])
@jwt_required()
def get_user_stats():
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    return jsonify({"total_processed_bytes": user.total_processed_bytes, "username": user.username})

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
            "id": p.id, 
            "name": p.name, 
            "flow": json.loads(p.structure), 
            "status": p.status, 
            "schedule": p.schedule,  # <--- NEW: Return schedule info
            "created_at": p.created_at.strftime('%Y-%m-%d %H:%M'), 
            "is_shared": False, 
            "permission": "owner"
        })
        
    shares = SharedPipeline.query.filter_by(user_id=current_user_id).all()
    for share in shares:
        p = share.pipeline
        if not p: continue 
        output.append({
            "id": p.id, 
            "name": f"{p.name} (Shared)", 
            "flow": json.loads(p.structure), 
            "status": p.status, 
            "schedule": None, 
            "created_at": p.created_at.strftime('%Y-%m-%d %H:%M'), 
            "is_shared": True, 
            "permission": share.role, 
            "owner": p.owner.username
        })
    
    # --- FIX IS HERE ---
    response = jsonify(output) # Create response object first
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    
    return response # Then return it

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

@main.route('/api/generate_pipeline', methods=['POST'])
def generate_pipeline():
    data = request.json
    prompt = data.get('prompt')
    if not prompt: return jsonify({"error": "No prompt provided"}), 400
    ai_plan = generate_pipeline_plan(prompt)
    if "error" in ai_plan: return jsonify(ai_plan), 500
    return jsonify(ai_plan)

@main.route('/api/catalog/search', methods=['GET'])
@jwt_required()
def catalog_search():
    current_user_id = int(get_jwt_identity())
    query = request.args.get('q', '').lower()
    raw_files = DataSource.query.filter_by(user_id=current_user_id).all()
    proc_files = ProcessedFile.query.filter_by(user_id=current_user_id).all()
    results = []
    def check_match(file_obj, ftype):
        match_found = False
        match_reason = []
        if query in file_obj.filename.lower():
            match_found = True
            match_reason.append("Filename")
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
            results.append({"id": file_obj.id, "name": file_obj.filename, "type": ftype, "rows": file_obj.row_count, "columns": cols, "matches": match_reason[:3]})
    for f in raw_files: check_match(f, 'Source')
    for f in proc_files: check_match(f, 'Processed')
    return jsonify(results)

@main.route('/api/catalog/lineage/<string:ftype>/<int:fid>', methods=['GET'])
@jwt_required()
def get_lineage(ftype, fid):
    current_user_id = int(get_jwt_identity())
    lineage_data = {"used_in": [], "created_by": None}
    target_filename = ""
    if ftype == 'Processed':
        f = ProcessedFile.query.get(fid)
        if f:
            if f.source_pipeline:
                lineage_data['created_by'] = {"id": f.source_pipeline.id, "name": f.source_pipeline.name}
            target_filename = f.filename
    elif ftype == 'Source':
        f = DataSource.query.get(fid)
        if f:
            target_filename = f.filename
            linked_processed = ProcessedFile.query.filter_by(user_id=current_user_id, filename=target_filename).order_by(ProcessedFile.created_at.desc()).first()
            if linked_processed and linked_processed.source_pipeline:
                 lineage_data['created_by'] = {"id": linked_processed.source_pipeline.id, "name": linked_processed.source_pipeline.name}
            else:
                lineage_data['created_by'] = {"name": "User Upload"}
    if target_filename:
        all_pipelines = Pipeline.query.filter_by(user_id=current_user_id).all()
        for p in all_pipelines:
            try:
                structure = json.loads(p.structure)
                for node in structure:
                    if node['type'].startswith('source_') or node['type'] == 'sourceNode':
                        p_file = node['data'].get('filename') or node['data'].get('label')
                        if p_file == target_filename:
                            lineage_data['used_in'].append({"id": p.id, "name": p.name})
                            break
            except: continue
    return jsonify(lineage_data)

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
        row_count = 0
        columns_json = "{}"
        try:
            df = None
            if filename.lower().endswith('.csv'):
                df = pd.read_csv(file_path, nrows=5) 
                with open(file_path) as f: row_count = sum(1 for line in f) - 1 
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
        new_source = DataSource(filename=filename, file_type=file_ext, file_size=formatted_size, filepath=file_path, user_id=current_user_id, row_count=row_count, columns=columns_json)
        db.session.add(new_source)
        db.session.commit()
        return jsonify({"message": "File uploaded successfully", "id": new_source.id}), 201

@main.route('/datasources', methods=['GET'])
@jwt_required()
def get_datasources():
    current_user_id = int(get_jwt_identity())
    raw_sources = DataSource.query.filter_by(user_id=current_user_id).all()
    processed_sources = ProcessedFile.query.filter_by(user_id=current_user_id).all()
    combined = []
    for s in raw_sources:
        combined.append({"id": s.id, "name": s.filename, "size": s.file_size, "type": s.file_type, "date": s.upload_date.strftime("%Y-%m-%d"), "category": "upload", "row_count": s.row_count, "columns": json.loads(s.columns) if s.columns else {}})
    for p in processed_sources:
        if p.filename.lower().endswith(('.csv', '.json', '.xlsx', '.xls')):
            combined.append({"id": p.id, "name": p.filename, "size": p.file_size_display, "type": p.file_type, "date": p.created_at.strftime("%Y-%m-%d"), "category": "processed", "row_count": p.row_count, "columns": json.loads(p.columns) if p.columns else {}})
    return jsonify(combined)

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
    
    if not pipeline: 
        return jsonify({"error": "Pipeline not found"}), 404
        
    data = request.json
    cron_type = data.get('type') # 'interval' or 'cron'
    value = data.get('value')
    
    job_id = f"pipeline_{id}"
    
    # 1. Remove existing job if any
    try: 
        scheduler.remove_job(job_id)
    except: 
        pass 
        
    # 2. If clearing schedule
    if not value:
        pipeline.schedule = None
        db.session.commit()
        return jsonify({"message": "Schedule removed"})

    # 3. Add new job
    # We pass 'current_app._get_current_object()' to ensure the real app object is passed to the thread
    app_obj = current_app._get_current_object()
    
    try:
        if cron_type == 'interval':
            # Run every X minutes
            scheduler.add_job(
                id=job_id, 
                func=jobs.run_pipeline_job, 
                args=[app_obj, id], 
                trigger='interval', 
                minutes=int(value)
            )
        elif cron_type == 'cron':
            # Run at HH:MM
            try:
                hour, minute = value.split(':')
                scheduler.add_job(
                    id=job_id, 
                    func=jobs.run_pipeline_job, 
                    args=[app_obj, id], 
                    trigger='cron', 
                    hour=int(hour), 
                    minute=int(minute)
                )
            except ValueError:
                return jsonify({"error": "Invalid time format. Use HH:MM"}), 400

        # 4. Save to DB
        pipeline.schedule = f"{cron_type}:{value}"
        db.session.commit()
        
        # 5. Debug info for user
        now = datetime.now().strftime("%H:%M")
        return jsonify({
            "message": f"Pipeline scheduled ({cron_type}: {value})",
            "server_time": f"Server time is {now}. Ensure you match this timezone."
        })
    except Exception as e:
        print(f"Scheduler Error: {e}")
        return jsonify({"error": f"Failed to schedule: {str(e)}"}), 500

@main.route('/preview-node', methods=['POST'])
@jwt_required()
def preview_node():
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    req_data = request.json
    target_node_id = req_data.get('targetNodeId')
    nodes = req_data.get('nodes', [])
    edges = req_data.get('edges', [])
    if not target_node_id: return jsonify({"error": "Target node ID required"}), 400
    try:
        base_dir = os.path.abspath(os.path.dirname(__file__))
        engine = PipelineEngine(nodes=nodes, edges=edges, user=user, base_dir=base_dir, db_session=db.session, preview_mode=True)
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
    if not file_entry: return jsonify({"error": "File not found"}), 404
    if not os.path.exists(file_entry.filepath): return jsonify({"error": "File missing from server"}), 404
    try:
        df = None
        if file_entry.filename.lower().endswith('.csv'): df = pd.read_csv(file_entry.filepath, nrows=100)
        elif file_entry.filename.lower().endswith('.json'): df = pd.read_json(file_entry.filepath).head(100)
        elif file_entry.filename.lower().endswith(('.xls', '.xlsx')): df = pd.read_excel(file_entry.filepath, nrows=100)
        if df is not None:
             records = df.where(pd.notnull(df), None).to_dict(orient='records')
             return jsonify({"columns": list(df.columns), "data": records, "filename": file_entry.filename})
        else: return jsonify({"error": "Preview not supported for this file type"}), 400
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
        output.append({"id": r.id, "status": r.status, "start_time": r.start_time.strftime('%Y-%m-%d %H:%M:%S'), "duration": duration, "logs": json.loads(r.logs) if r.logs else []})
    return jsonify(output)