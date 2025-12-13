from . import db
from datetime import datetime

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    total_processed_bytes = db.Column(db.Integer, default=0)
    
    # Relationships
    pipelines = db.relationship('Pipeline', backref='owner', lazy=True)
    datasources = db.relationship('DataSource', backref='owner', lazy=True)

class Pipeline(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    structure = db.Column(db.Text, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)

class DataSource(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    file_type = db.Column(db.String(50)) # e.g., 'CSV', 'JSON'
    file_size = db.Column(db.String(50)) # e.g., '2.4 MB'
    upload_date = db.Column(db.DateTime, default=datetime.utcnow)
    filepath = db.Column(db.String(500), nullable=False) # Location on disk
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)