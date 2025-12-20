from datetime import datetime
from . import db

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), index=True, unique=True)
    email = db.Column(db.String(120), index=True, unique=True)
    password_hash = db.Column(db.String(128))
    is_admin = db.Column(db.Boolean, default=False)
    is_suspended = db.Column(db.Boolean, default=False)
    total_processed_bytes = db.Column(db.Integer, default=0)
    
    pipelines = db.relationship('Pipeline', backref='owner', lazy='dynamic')
    datasources = db.relationship('DataSource', backref='owner', lazy='dynamic')

class Pipeline(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(140))
    structure = db.Column(db.Text) # JSON string of nodes/edges
    status = db.Column(db.String(20), default='Ready') 
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    
    # FIXED: Added cascade to delete shared records when pipeline is deleted
    shares = db.relationship('SharedPipeline', backref='pipeline', lazy='dynamic', cascade="all, delete-orphan")
    runs = db.relationship('PipelineRun', backref='pipeline', lazy='dynamic', cascade="all, delete-orphan")

class PipelineRun(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    pipeline_id = db.Column(db.Integer, db.ForeignKey('pipeline.id'), nullable=False)
    status = db.Column(db.String(20), default='Running') # Running, Success, Failed
    start_time = db.Column(db.DateTime, default=datetime.utcnow)
    end_time = db.Column(db.DateTime)
    logs = db.Column(db.Text) # JSON string

class SharedPipeline(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    pipeline_id = db.Column(db.Integer, db.ForeignKey('pipeline.id'))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    role = db.Column(db.String(20), default='viewer') # viewer, editor

class DataSource(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(140))
    file_type = db.Column(db.String(20))
    file_size = db.Column(db.String(20))
    filepath = db.Column(db.String(200))
    upload_date = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))

class ProcessedFile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(140))
    file_type = db.Column(db.String(20))
    file_size_display = db.Column(db.String(20))
    file_size_bytes = db.Column(db.Integer)
    filepath = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))