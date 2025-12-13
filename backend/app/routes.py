import json
import os
import sqlite3
import pandas as pd
from datetime import datetime
from flask import Blueprint, jsonify, request, current_app, send_from_directory
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from . import db
from .models import Pipeline, User, DataSource

main = Blueprint('main', __name__)

# --- UTILITIES ---

def get_size_format(b, factor=1024, suffix="B"):
    for unit in ["", "K", "M", "G", "T", "P", "E", "Z"]:
        if b < factor:
            return f"{b:.2f} {unit}{suffix}"
        b /= factor
    return f"{b:.2f} Y{suffix}"

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
    return jsonify({
        "message": "Login successful!", 
        "token": access_token, 
        "user": {"id": user.id, "username": user.username}
    })

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
    new_pipeline = Pipeline(name=data.get('name', 'Untitled Pipeline'), structure=json.dumps(data.get('flow')), user_id=current_user_id)
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
        output.append({ "id": p.id, "name": p.name, "flow": json.loads(p.structure), "status": p.status, "created_at": p.created_at.strftime('%Y-%m-%d %H:%M') })
    return jsonify(output)

@main.route('/pipelines/<int:id>', methods=['GET'])
@jwt_required()
def get_pipeline(id):
    current_user_id = int(get_jwt_identity())
    pipeline = Pipeline.query.filter_by(id=id, user_id=current_user_id).first()
    if not pipeline: return jsonify({"error": "Pipeline not found"}), 404
    return jsonify({ "id": pipeline.id, "name": pipeline.name, "flow": json.loads(pipeline.structure), "status": pipeline.status })

@main.route('/pipelines/<int:id>', methods=['PUT'])
@jwt_required()
def update_pipeline(id):
    current_user_id = int(get_jwt_identity())
    pipeline = Pipeline.query.filter_by(id=id, user_id=current_user_id).first()
    if not pipeline: return jsonify({"error": "Pipeline not found"}), 404
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
    if not pipeline: return jsonify({"error": "Pipeline not found"}), 404
    db.session.delete(pipeline)
    db.session.commit()
    return jsonify({"message": "Pipeline deleted successfully!"})

# --- PIPELINE EXECUTION ENGINE ---

@main.route('/run-pipeline', methods=['POST'])
@jwt_required()
def run_pipeline():
    pipeline_entry = None
    try:
        current_user_id = int(get_jwt_identity())
        user = User.query.get(current_user_id)

        req_data = request.json
        nodes = req_data.get('nodes', [])
        edges = req_data.get('edges', [])
        pipeline_id = req_data.get('pipelineId') 

        if pipeline_id:
            pipeline_entry = Pipeline.query.get(pipeline_id)
            if pipeline_entry:
                pipeline_entry.status = 'Active'
                db.session.commit()
        
        if not nodes: return jsonify({"error": "No nodes provided"}), 400

        adj_list = {node['id']: [] for node in nodes}
        node_map = {node['id']: node for node in nodes}
        for edge in edges:
            if edge['source'] in adj_list: adj_list[edge['source']].append(edge['target'])

        in_degree = {node['id']: 0 for node in nodes}
        for edge in edges: in_degree[edge['target']] += 1

        queue = [n['id'] for n in nodes if in_degree[n['id']] == 0]
        data_store = {}
        execution_log = []
        processed_bytes_in_run = 0 

        base_dir = os.path.abspath(os.path.dirname(__file__))
        uploads_dir = os.path.join(base_dir, '..', 'uploads')
        processed_dir = os.path.join(base_dir, '..', 'processed')
        if not os.path.exists(processed_dir): os.makedirs(processed_dir)

        while queue:
            current_id = queue.pop(0)
            current_node = node_map[current_id]
            node_type = current_node['type']
            node_data = current_node['data']
            
            try:
                # --- SOURCE NODES ---
                if node_type.startswith('source_'):
                    filename = node_data.get('filename')
                    if not filename: raise ValueError(f"Please select a file for the '{node_data.get('label')}' node.")
                    file_path = os.path.join(uploads_dir, filename)
                    if not os.path.exists(file_path): raise FileNotFoundError(f"File '{filename}' not found.")
                    
                    if filename.lower().endswith('.csv'): df = pd.read_csv(file_path)
                    elif filename.lower().endswith('.json'): df = pd.read_json(file_path)
                    elif filename.lower().endswith(('.xls', '.xlsx')): df = pd.read_excel(file_path)
                    else: raise ValueError("Unsupported format")
                    data_store[current_id] = df
                    execution_log.append(f"Loaded {filename}: {len(df)} rows")

                # --- 1. FILTER ---
                elif node_type == 'filterNode':
                    parent_ids = [e['source'] for e in edges if e['target'] == current_id]
                    if not parent_ids: raise ValueError("Disconnected node")
                    df = data_store.get(parent_ids[0])
                    col, op, val = node_data.get('column'), node_data.get('condition', '>'), safe_convert(node_data.get('value'))
                    if col and col in df.columns:
                        if op == '>': df = df[df[col] > val]
                        elif op == '<': df = df[df[col] < val]
                        elif op == '==': df = df[df[col] == val]
                        elif op == '!=': df = df[df[col] != val]
                        execution_log.append(f"Filtered {col} {op} {val}: {len(df)} rows")
                    data_store[current_id] = df

                # --- EXISTING TRANS ---
                elif node_type == 'trans_sort':
                    parent_ids = [e['source'] for e in edges if e['target'] == current_id]
                    df = data_store.get(parent_ids[0])
                    col = node_data.get('column')
                    ascending = node_data.get('order') == 'true'
                    if col and col in df.columns:
                        df = df.sort_values(by=col, ascending=ascending)
                        execution_log.append(f"Sorted by {col}")
                    data_store[current_id] = df

                elif node_type == 'trans_select':
                    parent_ids = [e['source'] for e in edges if e['target'] == current_id]
                    df = data_store.get(parent_ids[0])
                    target_cols = [c.strip() for c in node_data.get('columns', '').split(',') if c.strip() in df.columns]
                    if target_cols:
                        df = df[target_cols]
                        execution_log.append(f"Selected columns: {target_cols}")
                    data_store[current_id] = df

                elif node_type == 'trans_rename':
                    parent_ids = [e['source'] for e in edges if e['target'] == current_id]
                    df = data_store.get(parent_ids[0])
                    old, new = node_data.get('oldName'), node_data.get('newName')
                    if old and new and old in df.columns:
                        df = df.rename(columns={old: new})
                        execution_log.append(f"Renamed {old} to {new}")
                    data_store[current_id] = df

                elif node_type == 'trans_dedupe':
                    parent_ids = [e['source'] for e in edges if e['target'] == current_id]
                    df = data_store.get(parent_ids[0])
                    before = len(df)
                    df = df.drop_duplicates()
                    execution_log.append(f"Removed {before - len(df)} duplicates")
                    data_store[current_id] = df

                elif node_type == 'trans_fillna':
                    parent_ids = [e['source'] for e in edges if e['target'] == current_id]
                    df = data_store.get(parent_ids[0])
                    col, val = node_data.get('column'), safe_convert(node_data.get('value'))
                    if col and col in df.columns:
                        df[col] = df[col].fillna(val)
                        execution_log.append(f"Filled missing in {col} with {val}")
                    elif not col:
                        df = df.fillna(val)
                        execution_log.append(f"Filled all missing with {val}")
                    data_store[current_id] = df

                elif node_type == 'trans_group':
                    parent_ids = [e['source'] for e in edges if e['target'] == current_id]
                    df = data_store.get(parent_ids[0])
                    group_col, target_col, op = node_data.get('groupCol'), node_data.get('targetCol'), node_data.get('operation', 'sum')
                    if group_col in df.columns and target_col in df.columns:
                        if op == 'sum': df = df.groupby(group_col)[target_col].sum().reset_index()
                        elif op == 'mean': df = df.groupby(group_col)[target_col].mean().reset_index()
                        elif op == 'count': df = df.groupby(group_col)[target_col].count().reset_index()
                        elif op == 'max': df = df.groupby(group_col)[target_col].max().reset_index()
                        elif op == 'min': df = df.groupby(group_col)[target_col].min().reset_index()
                        execution_log.append(f"Grouped {target_col} by {group_col} ({op})")
                    data_store[current_id] = df

                elif node_type == 'trans_join':
                    parent_ids = [e['source'] for e in edges if e['target'] == current_id]
                    if len(parent_ids) < 2: raise ValueError("Join node needs 2 inputs")
                    df_left = data_store.get(parent_ids[0])
                    df_right = data_store.get(parent_ids[1])
                    key, how = node_data.get('key'), node_data.get('how', 'inner')
                    if key in df_left.columns and key in df_right.columns:
                        df = pd.merge(df_left, df_right, on=key, how=how)
                        execution_log.append(f"Joined datasets on {key} ({how})")
                    else: raise ValueError(f"Join key '{key}' not found in both datasets")
                    data_store[current_id] = df

                # --- NEW ADVANCED NODES ---

                # 9. CAST (Convert Type)
                elif node_type == 'trans_cast':
                    parent_ids = [e['source'] for e in edges if e['target'] == current_id]
                    df = data_store.get(parent_ids[0])
                    col = node_data.get('column')
                    target_type = node_data.get('targetType')

                    if col and col in df.columns:
                        if target_type == 'int':
                            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0).astype(int)
                        elif target_type == 'float':
                            df[col] = pd.to_numeric(df[col], errors='coerce')
                        elif target_type == 'string':
                            df[col] = df[col].astype(str)
                        elif target_type == 'date':
                            df[col] = pd.to_datetime(df[col], errors='coerce')
                        execution_log.append(f"Converted {col} to {target_type}")
                    data_store[current_id] = df

                # 10. STRING OPS
                elif node_type == 'trans_string':
                    parent_ids = [e['source'] for e in edges if e['target'] == current_id]
                    df = data_store.get(parent_ids[0])
                    col = node_data.get('column')
                    op = node_data.get('operation')

                    if col and col in df.columns:
                        if op == 'upper': df[col] = df[col].astype(str).str.upper()
                        elif op == 'lower': df[col] = df[col].astype(str).str.lower()
                        elif op == 'strip': df[col] = df[col].astype(str).str.strip()
                        elif op == 'title': df[col] = df[col].astype(str).str.title()
                        execution_log.append(f"Applied {op} to {col}")
                    data_store[current_id] = df

                # 11. CALC
                elif node_type == 'trans_calc':
                    parent_ids = [e['source'] for e in edges if e['target'] == current_id]
                    df = data_store.get(parent_ids[0])
                    colA, colB, op, newCol = node_data.get('colA'), node_data.get('colB'), node_data.get('op'), node_data.get('newCol')

                    if colA in df.columns and colB in df.columns:
                        # Ensure numeric
                        valA = pd.to_numeric(df[colA], errors='coerce').fillna(0)
                        valB = pd.to_numeric(df[colB], errors='coerce').fillna(0)
                        
                        if op == '+': df[newCol] = valA + valB
                        elif op == '-': df[newCol] = valA - valB
                        elif op == '*': df[newCol] = valA * valB
                        elif op == '/': df[newCol] = valA / valB
                        execution_log.append(f"Calculated {newCol} = {colA} {op} {colB}")
                    data_store[current_id] = df

                # 12. LIMIT
                elif node_type == 'trans_limit':
                    parent_ids = [e['source'] for e in edges if e['target'] == current_id]
                    df = data_store.get(parent_ids[0])
                    limit = int(node_data.get('limit', 100))
                    df = df.head(limit)
                    execution_log.append(f"Limited to top {limit} rows")
                    data_store[current_id] = df

                # 13. CONSTANT
                elif node_type == 'trans_constant':
                    parent_ids = [e['source'] for e in edges if e['target'] == current_id]
                    df = data_store.get(parent_ids[0])
                    colName = node_data.get('colName')
                    value = node_data.get('value')
                    
                    if colName:
                        df[colName] = value
                        execution_log.append(f"Added column {colName} with value '{value}'")
                    data_store[current_id] = df

                # --- DESTINATION NODES ---
                elif node_type.startswith('dest_'):
                    parent_ids = [e['source'] for e in edges if e['target'] == current_id]
                    if not parent_ids: raise ValueError("Destination disconnected")
                    df_to_save = data_store.get(parent_ids[0])
                    if df_to_save is None: raise ValueError("No data to save")

                    output_name = node_data.get('outputName', 'output')
                    file_path = ""
                    
                    if node_type == 'dest_csv':
                        if not output_name.endswith('.csv'): output_name += '.csv'
                        file_path = os.path.join(processed_dir, output_name)
                        df_to_save.to_csv(file_path, index=False)
                    elif node_type == 'dest_json':
                        if not output_name.endswith('.json'): output_name += '.json'
                        file_path = os.path.join(processed_dir, output_name)
                        df_to_save.to_json(file_path, orient='records')
                    elif node_type == 'dest_excel':
                        if not output_name.endswith('.xlsx'): output_name += '.xlsx'
                        file_path = os.path.join(processed_dir, output_name)
                        df_to_save.to_excel(file_path, index=False)
                    elif node_type == 'dest_db':
                        if not output_name.endswith('.db'): output_name += '.db'
                        file_path = os.path.join(processed_dir, output_name)
                        with sqlite3.connect(file_path) as conn:
                            df_to_save.to_sql('export_data', conn, if_exists='replace', index=False)

                    if os.path.exists(file_path):
                        file_size = os.path.getsize(file_path)
                        processed_bytes_in_run += file_size
                        execution_log.append(f"Saved to {output_name} ({get_size_format(file_size)})")

            except Exception as e:
                if pipeline_entry:
                    pipeline_entry.status = 'Ready'
                    db.session.commit()
                return jsonify({"error": f"Node '{node_data.get('label', node_type)}' Error: {str(e)}", "logs": execution_log}), 500

            if current_id in adj_list:
                for child_id in adj_list[current_id]:
                    queue.append(child_id)
        
        if processed_bytes_in_run > 0:
            user.total_processed_bytes += processed_bytes_in_run
            db.session.commit()

        if pipeline_entry:
            pipeline_entry.status = 'Ready'
            db.session.commit()
        
        return jsonify({"message": "Pipeline Executed Successfully", "logs": execution_log})

    except Exception as e:
        if pipeline_entry:
            pipeline_entry.status = 'Ready'
            db.session.commit()
        print(f"Pipeline Error: {e}")
        return jsonify({"error": str(e)}), 500

# --- DATA SOURCE ROUTES ---
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
        new_source = DataSource(filename=filename, file_type=filename.rsplit('.', 1)[1].upper() if '.' in filename else 'UNKNOWN', file_size=get_size_format(file_size), filepath=file_path, user_id=current_user_id)
        db.session.add(new_source)
        db.session.commit()
        return jsonify({"message": "File uploaded successfully", "id": new_source.id}), 201

@main.route('/datasources', methods=['GET'])
@jwt_required()
def get_datasources():
    current_user_id = int(get_jwt_identity())
    sources = DataSource.query.filter_by(user_id=current_user_id).all()
    output = []
    for s in sources: output.append({ "id": s.id, "name": s.filename, "type": s.file_type, "size": s.file_size, "date": s.upload_date.strftime("%Y-%m-%d") })
    return jsonify(output)

@main.route('/datasources/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_datasource(id):
    current_user_id = int(get_jwt_identity())
    source = DataSource.query.filter_by(id=id, user_id=current_user_id).first()
    if not source: return jsonify({"error": "File not found"}), 404
    db.session.delete(source)
    db.session.commit()
    if os.path.exists(source.filepath): os.remove(source.filepath)
    return jsonify({"message": "File removed successfully!"})

# --- PROCESSED FILE ROUTES ---
@main.route('/processed-files', methods=['GET'])
@jwt_required()
def get_processed_files():
    base_dir = os.path.abspath(os.path.dirname(__file__))
    processed_dir = os.path.join(base_dir, '..', 'processed')
    if not os.path.exists(processed_dir): return jsonify([])
    files = []
    for f in os.listdir(processed_dir):
        file_path = os.path.join(processed_dir, f)
        if os.path.isfile(file_path):
            size = os.path.getsize(file_path)
            ext = f.split('.')[-1].lower()
            ftype = 'CSV'
            if ext == 'json': ftype = 'JSON'
            elif ext in ['xls', 'xlsx']: ftype = 'Excel'
            elif ext == 'db': ftype = 'Database'
            files.append({ "name": f, "type": ftype, "size": get_size_format(size), "size_bytes": size, "date": datetime.fromtimestamp(os.path.getmtime(file_path)).strftime('%Y-%m-%d %H:%M') })
    return jsonify(files)

@main.route('/download/processed/<path:filename>', methods=['GET'])
def download_processed_file(filename):
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