from . import db
from datetime import datetime

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    # INCREASED LENGTH: Fixed login issue (modern hashes like scrypt exceed 128 chars)
    password_hash = db.Column(db.String(256)) 
    total_processed_bytes = db.Column(db.Integer, default=0)
    is_admin = db.Column(db.Boolean, default=False)
    
    # NEW: Account Suspension Status
    is_suspended = db.Column(db.Boolean, default=False)

    pipelines = db.relationship('Pipeline', backref='owner', lazy=True)
    datasources = db.relationship('DataSource', backref='owner', lazy=True)
    processed_files = db.relationship('ProcessedFile', backref='owner', lazy=True)

class Pipeline(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    structure = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='Ready') 
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

class DataSource(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    file_type = db.Column(db.String(50))
    file_size = db.Column(db.String(50))
    filepath = db.Column(db.String(500))
    upload_date = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

class ProcessedFile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    file_type = db.Column(db.String(50)) 
    file_size_bytes = db.Column(db.Integer) 
    file_size_display = db.Column(db.String(50))
    filepath = db.Column(db.String(500), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)