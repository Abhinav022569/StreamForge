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
    
    new_user = User(
        username=data['fullName'],
        email=data['email'],
        password_hash=hashed_password
    )
    
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({"message": "User created successfully!"}), 201

@main.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not check_password_hash(user.password_hash, data['password']):
        return jsonify({"error": "Invalid credentials"}), 401
    
    # Create the "Wristband" (Token)
    access_token = create_access_token(identity=user.id)
    
    return jsonify({
        "message": "Login successful!",
        "token": access_token,
        "user": {"id": user.id, "username": user.username}
    })

# --- PIPELINE ROUTES (Now Protected!) ---

@main.route('/pipelines', methods=['POST'])
@jwt_required() # <--- Keeps the door locked without a token
def save_pipeline():
    current_user_id = get_jwt_identity() # Who is asking?
    data = request.get_json()
    
    new_pipeline = Pipeline(
        name=data.get('name', 'Untitled Pipeline'),
        structure=json.dumps(data.get('flow')),
        user_id=current_user_id # Link to the specific user
    )
    
    db.session.add(new_pipeline)
    db.session.commit()
    
    return jsonify({"message": "Pipeline Saved!", "id": new_pipeline.id})

@main.route('/pipelines', methods=['GET'])
@jwt_required()
def get_pipelines():
    current_user_id = get_jwt_identity()
    # Only show pipelines belonging to THIS user
    pipelines = Pipeline.query.filter_by(user_id=current_user_id).all()
    
    output = []
    for p in pipelines:
        output.append({
            "id": p.id,
            "name": p.name,
            "flow": json.loads(p.structure)
        })
    
    return jsonify(output)