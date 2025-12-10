import json
from flask import Blueprint, jsonify, request
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from . import db
from .models import Pipeline, User

main = Blueprint('main', __name__)

@main.route('/', methods=['GET'])
def home():
    return jsonify({"message": "The Modular ETL Engine is Online!"})

# --- AUTHENTICATION ROUTES ---

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

# --- NEW ROUTES (These were missing!) ---

@main.route('/pipelines/<int:id>', methods=['GET'])
@jwt_required()
def get_pipeline(id):
    current_user_id = int(get_jwt_identity())
    # Find pipeline that matches ID and belongs to current user
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