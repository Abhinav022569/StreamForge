import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_socketio import SocketIO
from flask_jwt_extended import JWTManager
from werkzeug.security import generate_password_hash

# Initialize extensions
db = SQLAlchemy()
socketio = SocketIO(cors_allowed_origins="*")
jwt = JWTManager()

def create_app():
    app = Flask(__name__)

    # Configuration
    base_dir = os.path.abspath(os.path.dirname(__file__))
    db_path = os.path.join(base_dir, '..', 'pipelines.db')
    
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = 'dev-secret-key'  # Change this in production
    app.config['JWT_SECRET_KEY'] = 'jwt-secret-key'

    # Initialize Plugins
    db.init_app(app)
    CORS(app)
    socketio.init_app(app)
    jwt.init_app(app)

    # Register Blueprints
    from .routes import main
    app.register_blueprint(main)

    # Create Database & Default Admin
    with app.app_context():
        db.create_all()
        create_default_admin()

    # --- CRITICAL: Import events to register SocketIO handlers ---
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