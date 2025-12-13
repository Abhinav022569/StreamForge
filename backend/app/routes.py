import json
import os
import pandas as pd
from datetime import datetime
from flask import Blueprint, jsonify, request, current_app
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from . import db
from .models import Pipeline, User, DataSource
from flask import send_from_directory

main = Blueprint('main', __name__)

# --- UTILITIES ---

def get_size_format(b, factor=1024, suffix="B"):
    """Converts bytes to human readable format"""
    for unit in ["", "K", "M", "G", "T", "P", "E", "Z"]:
        if b < factor:
            return f"{b:.2f} {unit}{suffix}"
        b /= factor
    return f"{b:.2f} Y{suffix}"

def safe_convert(val):
    """Attempt to convert string value to int/float for filtering"""
    try:
        return int(val)
    except (ValueError, TypeError):
        try:
            return float(val)
        except (ValueError, TypeError):
            return val  # Return as string if not a number

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

# --- PIPELINE EXECUTION ENGINE ---

@main.route('/run-pipeline', methods=['POST'])
def run_pipeline():
    try:
        req_data = request.json
        nodes = req_data.get('nodes', [])
        edges = req_data.get('edges', [])
        
        if not nodes:
            return jsonify({"error": "No nodes provided"}), 400

        # Build Adjacency List
        adj_list = {node['id']: [] for node in nodes}
        node_map = {node['id']: node for node in nodes}
        
        for edge in edges:
            source = edge['source']
            target = edge['target']
            if source in adj_list:
                adj_list[source].append(target)

        # Identify Sources
        in_degree = {node['id']: 0 for node in nodes}
        for edge in edges:
            in_degree[edge['target']] += 1

        queue = [n['id'] for n in nodes if in_degree[n['id']] == 0]
        
        # Maps node_id -> DataFrame
        data_store = {}
        execution_log = []

        base_dir = os.path.abspath(os.path.dirname(__file__))
        uploads_dir = os.path.join(base_dir, '..', 'uploads')
        processed_dir = os.path.join(base_dir, '..', 'processed')

        if not os.path.exists(processed_dir):
            os.makedirs(processed_dir)

        while queue:
            current_id = queue.pop(0)
            current_node = node_map[current_id]
            node_type = current_node['type']
            node_data = current_node['data']
            
            try:
                # --- SOURCE NODES ---
                if node_type.startswith('source_'):
                    filename = node_data.get('filename')
                    
                    if not filename:
                        # CRITICAL FIX: Warn user if no file is selected
                        raise ValueError(f"Please select a file for the '{node_data.get('label')}' node.")

                    file_path = os.path.join(uploads_dir, filename)
                    
                    if not os.path.exists(file_path):
                        raise FileNotFoundError(f"File '{filename}' not found. Please upload it in Data Sources.")
                    
                    if filename.lower().endswith('.csv'):
                        df = pd.read_csv(file_path)
                    elif filename.lower().endswith('.json'):
                        df = pd.read_json(file_path)
                    elif filename.lower().endswith(('.xls', '.xlsx')):
                        df = pd.read_excel(file_path)
                    else:
                        raise ValueError("Unsupported format")
                    
                    data_store[current_id] = df
                    execution_log.append(f"Loaded {filename}: {len(df)} rows")

                # --- FILTER NODE ---
                elif node_type == 'filterNode':
                    parent_ids = [e['source'] for e in edges if e['target'] == current_id]
                    if not parent_ids: raise ValueError("Filter node disconnected")
                    
                    parent_df = data_store.get(parent_ids[0])
                    if parent_df is None: raise ValueError("No data received for filter")

                    col = node_data.get('column')
                    op = node_data.get('condition', '>')
                    val = safe_convert(node_data.get('value'))

                    if col and col in parent_df.columns:
                        if op == '>': df = parent_df[parent_df[col] > val]
                        elif op == '<': df = parent_df[parent_df[col] < val]
                        elif op == '==': df = parent_df[parent_df[col] == val]
                        elif op == '!=': df = parent_df[parent_df[col] != val]
                        else: df = parent_df
                        execution_log.append(f"Filtered {col} {op} {val}: {len(df)} rows")
                    else:
                        df = parent_df
                        execution_log.append("Filter passed through (invalid or missing column)")
                    
                    data_store[current_id] = df

                # --- DESTINATION NODES ---
                elif node_type.startswith('dest_'):
                    parent_ids = [e['source'] for e in edges if e['target'] == current_id]
                    if not parent_ids: raise ValueError("Destination disconnected")
                    
                    df_to_save = data_store.get(parent_ids[0])
                    if df_to_save is None: raise ValueError("No data to save")

                    output_name = node_data.get('outputName', 'output')
                    if node_type == 'dest_csv':
                        if not output_name.endswith('.csv'): output_name += '.csv'
                        df_to_save.to_csv(os.path.join(processed_dir, output_name), index=False)
                    elif node_type == 'dest_json':
                        if not output_name.endswith('.json'): output_name += '.json'
                        df_to_save.to_json(os.path.join(processed_dir, output_name), orient='records')
                    elif node_type == 'dest_excel':
                        if not output_name.endswith('.xlsx'): output_name += '.xlsx'
                        df_to_save.to_excel(os.path.join(processed_dir, output_name), index=False)

                    execution_log.append(f"Saved to {output_name}")

            except Exception as e:
                # Capture the specific error from the node and send it back
                return jsonify({"error": f"Node '{node_data.get('label', node_type)}' Error: {str(e)}", "logs": execution_log}), 500

            # Add children
            if current_id in adj_list:
                for child_id in adj_list[current_id]:
                    queue.append(child_id)

        return jsonify({
            "message": "Pipeline Executed Successfully", 
            "logs": execution_log
        })

    except Exception as e:
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

# --- PROCESSED FILE ROUTES (Add to backend/app/routes.py) ---


@main.route('/processed-files', methods=['GET'])
@jwt_required()
def get_processed_files():
    base_dir = os.path.abspath(os.path.dirname(__file__))
    processed_dir = os.path.join(base_dir, '..', 'processed')
    
    if not os.path.exists(processed_dir):
        return jsonify([])

    files = []
    for f in os.listdir(processed_dir):
        file_path = os.path.join(processed_dir, f)
        if os.path.isfile(file_path):
            size = os.path.getsize(file_path)
            ext = f.split('.')[-1].lower()
            
            ftype = 'CSV'
            if ext == 'json': ftype = 'JSON'
            elif ext in ['xls', 'xlsx']: ftype = 'Excel'

            files.append({
                "name": f,
                "type": ftype,
                "size": get_size_format(size),
                "date": datetime.fromtimestamp(os.path.getmtime(file_path)).strftime('%Y-%m-%d %H:%M')
            })
    
    return jsonify(files)

@main.route('/download/processed/<path:filename>', methods=['GET'])
def download_processed_file(filename):
    # Public route or protected? Ideally protected but simple for now
    base_dir = os.path.abspath(os.path.dirname(__file__))
    processed_dir = os.path.join(base_dir, '..', 'processed')
    return send_from_directory(processed_dir, filename, as_attachment=True)

@main.route('/processed-files/<path:filename>', methods=['DELETE'])
@jwt_required()
def delete_processed_file(filename):
    base_dir = os.path.abspath(os.path.dirname(__file__))
    file_path = os.path.join(base_dir, '..', 'processed', filename)
    
    if os.path.exists(file_path):
        os.remove(file_path)
        return jsonify({"message": "File deleted"})
    else:
        return jsonify({"error": "File not found"}), 404