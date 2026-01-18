import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_socketio import SocketIO
from flask_jwt_extended import JWTManager
from flask_apscheduler import APScheduler
from werkzeug.security import generate_password_hash

# Initialize extensions
db = SQLAlchemy()
socketio = SocketIO(cors_allowed_origins="*")
jwt = JWTManager()
scheduler = APScheduler() # Initialize Scheduler here

def create_app():
    app = Flask(__name__)

    # Configuration
    base_dir = os.path.abspath(os.path.dirname(__file__))
    db_path = os.path.join(base_dir, '..', 'pipelines.db')
    
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = 'dev-secret-key' 
    app.config['JWT_SECRET_KEY'] = 'jwt-secret-key'
    
    # Scheduler Config
    app.config['SCHEDULER_API_ENABLED'] = True

    # Initialize Plugins
    db.init_app(app)
    CORS(app)
    socketio.init_app(app)
    jwt.init_app(app)
    
    # Initialize Scheduler
    scheduler.init_app(app)
    scheduler.start()

    # Register Blueprints
    from .routes import main
    app.register_blueprint(main)

    # Database & Startup Logic
    with app.app_context():
        db.create_all()
        create_default_admin()
        
        # --- Restore Schedules on Startup ---
        load_scheduled_jobs(app) 

    from . import events

    return app

def create_default_admin():
    from .models import User
    admin = User.query.filter_by(username='admin').first()
    if not admin:
        hashed_pw = generate_password_hash('admin123')
        new_admin = User(username='admin', email='admin@streamforge.io', password_hash=hashed_pw, is_admin=True)
        db.session.add(new_admin)
        db.session.commit()
        print("Default admin created: admin / admin123")

def load_scheduled_jobs(app):
    """
    Reads all pipelines from the DB.
    If they have a schedule string, re-add them to the scheduler.
    """
    from .models import Pipeline
    from .jobs import run_pipeline_job 
    
    print(" ↻ Checking for scheduled pipelines...")
    
    try:
        # We are already inside app_context in create_app
        pipelines = Pipeline.query.filter(Pipeline.schedule != None).all()
        
        count = 0
        for p in pipelines:
            if not p.schedule: continue
            
            job_id = f"pipeline_{p.id}"
            
            # Skip if already exists (prevents duplicates on reload)
            if scheduler.get_job(job_id):
                continue

            try:
                type_, val = p.schedule.split(':')
                
                # Pass app._get_current_object() or app to the job
                # Note: In create_app, 'app' is the object we need.
                
                if type_ == 'interval':
                    scheduler.add_job(
                        id=job_id,
                        func=run_pipeline_job,
                        args=[app, p.id], 
                        trigger='interval',
                        minutes=int(val),
                        replace_existing=True
                    )
                elif type_ == 'cron':
                    hour, minute = val.split(':')
                    scheduler.add_job(
                        id=job_id,
                        func=run_pipeline_job,
                        args=[app, p.id],
                        trigger='cron',
                        hour=int(hour),
                        minute=int(minute),
                        replace_existing=True
                    )
                count += 1
            except Exception as e:
                print(f" ⚠ Failed to load schedule for Pipeline {p.id}: {e}")

        if count > 0:
            print(f" ✅ Restored {count} scheduled jobs from database.")
    except Exception as e:
        print(f"Error loading jobs: {e}")