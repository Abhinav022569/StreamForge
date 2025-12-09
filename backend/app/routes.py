import json
from flask import Blueprint, jsonify, request
from . import db
from .models import Pipeline

main = Blueprint('main', __name__)

@main.route('/', methods=['GET'])
def home():
    return jsonify({"message": "The Modular ETL Engine is Online!"})

@main.route('/pipelines', methods=['POST'])
def save_pipeline():
    data = request.get_json()
    
    new_pipeline = Pipeline(
        name=data.get('name', 'Untitled Pipeline'),
        structure=json.dumps(data.get('flow'))
    )
    
    db.session.add(new_pipeline)
    db.session.commit()
    
    return jsonify({"message": "Pipeline Saved!", "id": new_pipeline.id})

@main.route('/pipelines', methods=['GET'])
def get_pipelines():
    pipelines = Pipeline.query.all()
    output = []
    
    for p in pipelines:
        output.append({
            "id": p.id,
            "name": p.name,
            "flow": json.loads(p.structure)
        })
    
    return jsonify(output)