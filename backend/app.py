import os
import json
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
CORS(app)

# 1. DATABASE CONFIGURATION
# This tells Flask to create a file named 'pipelines.db' in your backend folder
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'pipelines.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize the Database
db = SQLAlchemy(app)

# 2. THE DATABASE MODEL (The Table Schema)
# We are creating a table named 'Pipeline' with 3 columns:
# - id: Unique number (1, 2, 3...)
# - name: A text name (e.g., "My Sales Cleaner")
# - structure: The huge JSON blob that holds all your nodes and edges
class Pipeline(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    structure = db.Column(db.Text, nullable=False) # We store the graph as a text string

# Create the database file if it doesn't exist
with app.app_context():
    db.create_all()

@app.route('/', methods=['GET'])
def home():
    return jsonify({"message": "The ETL Engine with Database is Online!"})

# --- NEW ROUTES FOR SAVING & LOADING ---

# SAVE: Frontend sends JSON -> We save to DB
@app.route('/pipelines', methods=['POST'])
def save_pipeline():
    data = request.get_json()
    
    # We convert the complex React Flow object into a simple string to store it
    new_pipeline = Pipeline(
        name=data.get('name', 'Untitled Pipeline'),
        structure=json.dumps(data.get('flow')) # 'flow' contains nodes and edges
    )
    
    db.session.add(new_pipeline)
    db.session.commit()
    
    return jsonify({"message": "Pipeline Saved!", "id": new_pipeline.id})

# LOAD: Frontend asks for list -> We get from DB
@app.route('/pipelines', methods=['GET'])
def get_pipelines():
    pipelines = Pipeline.query.all()
    output = []
    
    for p in pipelines:
        output.append({
            "id": p.id,
            "name": p.name,
            "flow": json.loads(p.structure) # Convert string back to JSON
        })
    
    return jsonify(output)

if __name__ == '__main__':
    app.run(debug=True, port=5000)