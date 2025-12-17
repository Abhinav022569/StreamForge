import json
import os
import sqlite3
import pandas as pd
# --- MATPLOTLIB SETUP ---
import matplotlib
matplotlib.use('Agg') # Essential for backend (non-GUI) environments
import matplotlib.pyplot as plt
# ------------------------
from datetime import datetime
from flask import Blueprint, jsonify, request, current_app, send_from_directory
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from . import db
from .models import Pipeline, User, DataSource, ProcessedFile, SharedPipeline
from .pipeline_engine import PipelineEngine, get_size_format # IMPORT THE ENGINE

main = Blueprint('main', __name__)

# --- UTILITIES ---
def safe_convert(val):
    """Attempt to convert string value to int/float for filtering"""
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
        print(f"DEBUG: Login attempt for email: {data.get('email')}")
        
        user = User.query.filter_by(email=data['email']).first()
        
        if not user:
            print("DEBUG: User not found in DBr")
            return jsonify({"error": "Invalid credentials"}), 401
            
        if user.is_suspended:
            print(f"DEBUG: User {user.username} is suspended")
            return jsonify({"error": "Your account has been suspended. Please contact the administrator."}), 403

        print(f"DEBUG: User found: {user.username}, ID: {user.id}, Is Admin: {user.is_admin}")
        
        is_valid = check_password_hash(user.password_hash, data['password'])
        
        if not is_valid:
            print("DEBUG: Password mismatch")
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
        print(f"DEBUG: Server Error during login: {str(e)}")
        return jsonify({"error": "Server error"}), 500

# --- USER SETTINGS ROUTES ---

@main.route('/user/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()
    
    if 'username' in data:
        user.username = data['username']
    
    if 'email' in data and data['email'] != user.email:
        existing = User.query.filter_by(email=data['email']).first()
        if existing:
            return jsonify({"error": "Email already in use"}), 400
        user.email = data['email']

    db.session.commit()
    
    return jsonify({
        "message": "Profile updated", 
        "user": {
            "id": user.id, 
            "username": user.username,
            "email": user.email,
            "is_admin": user.is_admin 
        }
    })

@main.route('/user/password', methods=['PUT'])
@jwt_required()
def change_password():
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    data = request.get_json()
    
    current_pass = data.get('currentPassword')
    new_pass = data.get('newPassword')
    
    if not check_password_hash(user.password_hash, current_pass):
        return jsonify({"error": "Incorrect current password"}), 401
        
    user.password_hash = generate_password_hash(new_pass)
    db.session.commit()
    
    return jsonify({"message": "Password changed successfully"})

@main.route('/user/account', methods=['DELETE'])
@jwt_required()
def delete_account():
    try:
        current_user_id = int(get_jwt_identity())
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({"error": "User not found"}), 404

        Pipeline.query.filter_by(user_id=current_user_id).delete()

        datasources = DataSource.query.filter_by(user_id=current_user_id).all()
        for ds in datasources:
            if ds.filepath and os.path.exists(ds.filepath):
                try:
                    os.remove(ds.filepath)
                except Exception as e:
                    print(f"Error deleting file {ds.filepath}: {e}")
            db.session.delete(ds)

        processed = ProcessedFile.query.filter_by(user_id=current_user_id).all()
        for pf in processed:
            if pf.filepath and os.path.exists(pf.filepath):
                try:
                    os.remove(pf.filepath)
                except Exception as e:
                    print(f"Error deleting file {pf.filepath}: {e}")
            db.session.delete(pf)

        db.session.delete(user)
        db.session.commit()
        
        return jsonify({"message": "Account deleted successfully"})
    except Exception as e:
        db.session.rollback()
        print(f"Delete Account Error: {str(e)}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500

# --- COLLABORATION ROUTES ---

@main.route('/collaboration/stats', methods=['GET'])
@jwt_required()
def get_collab_stats():
    current_user_id = int(get_jwt_identity())
    
    # 1. Count Shared With Me
    shared_with_me_count = SharedPipeline.query.filter_by(user_id=current_user_id).count()
    
    # 2. Count My Shared Pipelines (distinct pipelines I own that are shared)
    my_shared_count = db.session.query(SharedPipeline.pipeline_id)\
        .join(Pipeline)\
        .filter(Pipeline.user_id == current_user_id)\
        .distinct().count()
    
    # 3. Team Members (Approximate: Unique users I interact with via shares)
    sharers = db.session.query(Pipeline.user_id)\
        .join(SharedPipeline, Pipeline.id == SharedPipeline.pipeline_id)\
        .filter(SharedPipeline.user_id == current_user_id)
    
    recipients = db.session.query(SharedPipeline.user_id)\
        .join(Pipeline, Pipeline.id == SharedPipeline.pipeline_id)\
        .filter(Pipeline.user_id == current_user_id)
    
    team_members = sharers.union(recipients).distinct().count()

    return jsonify({
        "shared_with_me": shared_with_me_count,
        "my_shared_pipelines": my_shared_count,
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
        owner = p.owner
        output.append({
            "id": p.id,
            "name": p.name,
            "owner_name": owner.username,
            "owner_email": owner.email,
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
        if p.shares:
            shared_users = []
            for s in p.shares:
                shared_users.append({
                    "share_id": s.id,
                    "username": s.recipient.username,
                    "email": s.recipient.email,
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

@main.route('/admin/stats', methods=['GET'])
@jwt_required()
def get_admin_stats():
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    
    if not user or not user.is_admin:
        return jsonify({"error": "Unauthorized"}), 403

    total_users = User.query.count()
    total_pipelines = Pipeline.query.count()
    active_pipelines = Pipeline.query.filter_by(status='Active').count()
    
    all_users = User.query.all()
    global_bytes = sum(u.total_processed_bytes for u in all_users)

    recent_users = []
    for u in User.query.order_by(User.id.desc()).limit(5).all():
        recent_users.append({
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "pipelines": len(u.pipelines)
        })

    return jsonify({
        "total_users": total_users,
        "total_pipelines": total_pipelines,
        "active_pipelines": active_pipelines,
        "total_processed_bytes": global_bytes,
        "recent_users": recent_users
    })

@main.route('/admin/users', methods=['GET'])
@jwt_required()
def get_all_users():
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    
    if not user or not user.is_admin:
        return jsonify({"error": "Unauthorized"}), 403

    all_users = User.query.all()
    output = []
    for u in all_users:
        output.append({
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "is_admin": u.is_admin,
            "is_suspended": u.is_suspended,
            "pipelines_count": len(u.pipelines),
            "processed_bytes": get_size_format(u.total_processed_bytes)
        })
    
    return jsonify(output)

@main.route('/admin/users/<int:user_id>/suspend', methods=['PUT'])
@jwt_required()
def suspend_user(user_id):
    current_user_id = int(get_jwt_identity())
    admin = User.query.get(current_user_id)
    
    if not admin or not admin.is_admin:
        return jsonify({"error": "Unauthorized"}), 403

    user_to_mod = User.query.get(user_id)
    if not user_to_mod:
        return jsonify({"error": "User not found"}), 404
        
    if user_to_mod.id == admin.id:
        return jsonify({"error": "Cannot suspend yourself"}), 400

    data = request.get_json()
    user_to_mod.is_suspended = data.get('is_suspended', True)
    db.session.commit()
    
    action = "suspended" if user_to_mod.is_suspended else "activated"
    return jsonify({"message": f"User {action} successfully", "is_suspended": user_to_mod.is_suspended})

@main.route('/user-stats', methods=['GET'])
@jwt_required()
def get_user_stats():
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    return jsonify({
        "total_processed_bytes": user.total_processed_bytes,
        "username": user.username
    })

# --- PIPELINE MANAGEMENT ROUTES ---

@main.route('/pipelines', methods=['POST'])
@jwt_required()
def create_pipeline():
    current_user_id = int(get_jwt_identity())
    data = request.get_json()
    
    new_pipeline = Pipeline(
        name=data.get('name', 'Untitled Pipeline'),
        structure=json.dumps(data.get('flow')),
        user_id=current_user_id
    )
    
    db.session.add(new_pipeline)
    db.session.commit()
    return jsonify({"message": "Pipeline Created!", "id": new_pipeline.id})

@main.route('/pipelines', methods=['GET'])
@jwt_required()
def get_pipelines():
    current_user_id = int(get_jwt_identity())
    
    # 1. My Pipelines
    pipelines = Pipeline.query.filter_by(user_id=current_user_id).all()
    output = []
    
    for p in pipelines:
        output.append({
            "id": p.id,
            "name": p.name,
            "flow": json.loads(p.structure),
            "status": p.status, 
            "created_at": p.created_at.strftime('%Y-%m-%d %H:%M'),
            "is_shared": False,
            "permission": "owner"
        })
        
    # 2. Pipelines Shared With Me
    shares = SharedPipeline.query.filter_by(user_id=current_user_id).all()
    for share in shares:
        p = share.pipeline
        output.append({
            "id": p.id,
            "name": f"{p.name} (Shared)",
            "flow": json.loads(p.structure),
            "status": p.status,
            "created_at": p.created_at.strftime('%Y-%m-%d %H:%M'),
            "is_shared": True,
            "permission": share.role, # 'viewer' or 'editor'
            "owner": p.owner.username
        })
        
    return jsonify(output)

@main.route('/pipelines/<int:id>', methods=['GET'])
@jwt_required()
def get_pipeline(id):
    current_user_id = int(get_jwt_identity())
    
    pipeline = Pipeline.query.filter_by(id=id, user_id=current_user_id).first()
    
    if not pipeline:
        share = SharedPipeline.query.filter_by(pipeline_id=id, user_id=current_user_id).first()
        if share:
            pipeline = share.pipeline
    
    if not pipeline:
        return jsonify({"error": "Pipeline not found or access denied"}), 404

    return jsonify({
        "id": pipeline.id,
        "name": pipeline.name,
        "flow": json.loads(pipeline.structure),
        "status": pipeline.status
    })

@main.route('/pipelines/<int:id>', methods=['PUT'])
@jwt_required()
def update_pipeline(id):
    current_user_id = int(get_jwt_identity())
    
    pipeline = Pipeline.query.filter_by(id=id, user_id=current_user_id).first()
    
    if not pipeline:
        share = SharedPipeline.query.filter_by(pipeline_id=id, user_id=current_user_id).first()
        if share and share.role == 'editor':
            pipeline = share.pipeline
    
    if not pipeline:
        return jsonify({"error": "Pipeline not found or read-only access"}), 404

    data = request.get_json()
    pipeline.name = data.get('name', pipeline.name)
    pipeline.structure = json.dumps(data.get('flow'))

    db.session.commit()
    return jsonify({"message": "Pipeline Updated Successfully!"})

@main.route('/pipelines/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_pipeline(id):
    current_user_id = int(get_jwt_identity())
    pipeline = Pipeline.query.filter_by(id=id, user_id=current_user_id).first()

    if not pipeline:
        return jsonify({"error": "Pipeline not found or unauthorized"}), 404

    db.session.delete(pipeline)
    db.session.commit()
    return jsonify({"message": "Pipeline deleted successfully!"})

# --- PIPELINE EXECUTION ENGINE (REFACTORED) ---

@main.route('/run-pipeline', methods=['POST'])
@jwt_required()
def run_pipeline():
    try:
        current_user_id = int(get_jwt_identity())
        user = User.query.get(current_user_id)
        req_data = request.json
        pipeline_id = req_data.get('pipelineId')

        # Check permissions
        pipeline_entry = None
        if pipeline_id:
            pipeline_entry = Pipeline.query.get(pipeline_id)
            if pipeline_entry.user_id != current_user_id:
                share = SharedPipeline.query.filter_by(pipeline_id=pipeline_id, user_id=current_user_id).first()
                if not share: return jsonify({"error": "Unauthorized"}), 403
            
            pipeline_entry.status = 'Active'
            db.session.commit()

        # Initialize Engine
        base_dir = os.path.abspath(os.path.dirname(__file__))
        engine = PipelineEngine(
            nodes=req_data.get('nodes', []),
            edges=req_data.get('edges', []),
            user=user,
            base_dir=base_dir,
            db_session=db.session
        )
        
        logs = engine.run()

        if pipeline_entry:
            pipeline_entry.status = 'Ready'
            db.session.commit()
        
        return jsonify({
            "message": "Pipeline Executed Successfully", 
            "logs": logs
        })

    except Exception as e:
        if 'pipeline_entry' in locals() and pipeline_entry:
            pipeline_entry.status = 'Ready'
            db.session.commit()
        print(f"Pipeline Error: {e}")
        return jsonify({"error": str(e)}), 500

# --- DATA SOURCE ROUTES ---

@main.route('/upload', methods=['POST'])
@jwt_required()
def upload_file():
    current_user_id = int(get_jwt_identity())
    
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file:
        filename = secure_filename(file.filename)
        base_dir = os.path.abspath(os.path.dirname(__file__))
        upload_folder = os.path.join(base_dir, '..', 'uploads')
        
        if not os.path.exists(upload_folder):
            os.makedirs(upload_folder)
            
        file_path = os.path.join(upload_folder, filename)
        file.save(file_path)
        
        file_size = os.path.getsize(file_path)
        formatted_size = get_size_format(file_size)
        file_ext = filename.rsplit('.', 1)[1].upper() if '.' in filename else 'UNKNOWN'

        new_source = DataSource(
            filename=filename,
            file_type=file_ext,
            file_size=formatted_size,
            filepath=file_path,
            user_id=current_user_id
        )
        
        db.session.add(new_source)
        db.session.commit()
        
        return jsonify({"message": "File uploaded successfully", "id": new_source.id}), 201

@main.route('/datasources', methods=['GET'])
@jwt_required()
def get_datasources():
    current_user_id = int(get_jwt_identity())
    sources = DataSource.query.filter_by(user_id=current_user_id).all()
    
    output = []
    for s in sources:
        output.append({
            "id": s.id,
            "name": s.filename,
            "type": s.file_type,
            "size": s.file_size,
            "date": s.upload_date.strftime("%Y-%m-%d")
        })
    
    return jsonify(output)

@main.route('/datasources/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_datasource(id):
    current_user_id = int(get_jwt_identity())
    source = DataSource.query.filter_by(id=id, user_id=current_user_id).first()

    if not source:
        return jsonify({"error": "File not found"}), 404

    db.session.delete(source)
    db.session.commit()
    
    if os.path.exists(source.filepath):
        os.remove(source.filepath)

    return jsonify({"message": "File removed successfully!"})

# --- PROCESSED FILE ROUTES ---

@main.route('/processed-files', methods=['GET'])
@jwt_required()
def get_processed_files():
    current_user_id = int(get_jwt_identity())
    
    files = ProcessedFile.query.filter_by(user_id=current_user_id).order_by(ProcessedFile.created_at.desc()).all()

    output = []
    for f in files:
        if os.path.exists(f.filepath):
            output.append({
                "id": f.id, 
                "name": f.filename,
                "type": f.file_type,
                "size": f.file_size_display,
                "size_bytes": f.file_size_bytes,
                "date": f.created_at.strftime('%Y-%m-%d %H:%M')
            })
    
    return jsonify(output)

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
    
    if not file_entry:
        return jsonify({"error": "File not found"}), 404

    if os.path.exists(file_entry.filepath):
        os.remove(file_entry.filepath)
    
    db.session.delete(file_entry)
    db.session.commit()

    return jsonify({"message": "File deleted"})