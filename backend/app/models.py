from . import db
from datetime import datetime

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256)) 
    total_processed_bytes = db.Column(db.Integer, default=0)
    is_admin = db.Column(db.Boolean, default=False)
    is_suspended = db.Column(db.Boolean, default=False)

    pipelines = db.relationship('Pipeline', backref='owner', lazy=True)
    datasources = db.relationship('DataSource', backref='owner', lazy=True)
    processed_files = db.relationship('ProcessedFile', backref='owner', lazy=True)
    
    # Relationships for sharing
    shared_with_me = db.relationship('SharedPipeline', foreign_keys='SharedPipeline.user_id', backref='recipient', lazy=True)

class Pipeline(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    structure = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='Ready') 
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Relationship to access shares of this pipeline
    shares = db.relationship('SharedPipeline', backref='pipeline', lazy=True, cascade="all, delete-orphan")

class SharedPipeline(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    pipeline_id = db.Column(db.Integer, db.ForeignKey('pipeline.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False) # User it is shared WITH
    role = db.Column(db.String(20), default='viewer') # 'viewer' or 'editor'
    shared_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # We can access the owner via pipeline.owner

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