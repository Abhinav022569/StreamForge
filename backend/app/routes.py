import json
import os
from datetime import datetime
from flask import Blueprint, jsonify, request, current_app
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from . import db
from .models import Pipeline, User, DataSource

main = Blueprint('main', __name__)

# --- UTILITIES ---
def get_size_format(b, factor=1024, suffix="B"):
    """Converts bytes to human readable format (e.g., 2.4 MB)"""
    for unit in ["", "K", "M", "G", "T", "P", "E", "Z"]:
        if b < factor:
            return f"{b:.2f} {unit}{suffix}"
        b /= factor
    return f"{b:.2f} Y{suffix}"

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
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not check_password_hash(user.password_hash, data['password']):
        return jsonify({"error": "Invalid credentials"}), 401
    
    access_token = create_access_token(identity=str(user.id))
    return jsonify({"message": "Login successful!", "token": access_token, "user": {"id": user.id, "username": user.username}})

# --- PIPELINE ROUTES ---

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
    pipelines = Pipeline.query.filter_by(user_id=current_user_id).all()
    output = []
    for p in pipelines:
        output.append({"id": p.id, "name": p.name, "flow": json.loads(p.structure)})
    return jsonify(output)

@main.route('/pipelines/<int:id>', methods=['GET'])
@jwt_required()
def get_pipeline(id):
    current_user_id = int(get_jwt_identity())
    pipeline = Pipeline.query.filter_by(id=id, user_id=current_user_id).first()

    if not pipeline:
        return jsonify({"error": "Pipeline not found"}), 404

    return jsonify({
        "id": pipeline.id,
        "name": pipeline.name,
        "flow": json.loads(pipeline.structure)
    })

@main.route('/pipelines/<int:id>', methods=['PUT'])
@jwt_required()
def update_pipeline(id):
    current_user_id = int(get_jwt_identity())
    pipeline = Pipeline.query.filter_by(id=id, user_id=current_user_id).first()

    if not pipeline:
        return jsonify({"error": "Pipeline not found"}), 404

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
        return jsonify({"error": "Pipeline not found"}), 404

    db.session.delete(pipeline)
    db.session.commit()
    return jsonify({"message": "Pipeline deleted successfully!"})

# --- DATA SOURCE ROUTES (NEW) ---

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
        
        # Determine upload path
        base_dir = os.path.abspath(os.path.dirname(__file__))
        upload_folder = os.path.join(base_dir, '..', 'uploads')
        
        if not os.path.exists(upload_folder):
            os.makedirs(upload_folder)
            
        file_path = os.path.join(upload_folder, filename)
        file.save(file_path)
        
        # Get file size
        file_size = os.path.getsize(file_path)
        formatted_size = get_size_format(file_size)
        
        # Determine Type (CSV, JSON, etc)
        file_ext = filename.rsplit('.', 1)[1].upper() if '.' in filename else 'UNKNOWN'

        # Save to DB
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

    # Remove from DB
    db.session.delete(source)
    db.session.commit()
    
    # Optional: Remove from disk as well?
    if os.path.exists(source.filepath):
        os.remove(source.filepath)

    return jsonify({"message": "File removed successfully!"})