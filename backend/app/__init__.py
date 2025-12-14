import os
from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from werkzeug.security import generate_password_hash # Import hashing function

db = SQLAlchemy()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    CORS(app)

    basedir = os.path.abspath(os.path.dirname(__file__))
    db_path = os.path.join(basedir, '..', 'pipelines.db')
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + db_path
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Change this secret key in production!
    app.config['JWT_SECRET_KEY'] = 'super-secret-key-change-this-in-prod' 
    
    db.init_app(app)
    jwt.init_app(app)

    from .routes import main
    app.register_blueprint(main)

    with app.app_context():
        # Create all tables (User, Pipeline, DataSource, ProcessedFile)
        db.create_all()

        # --- SEED DEFAULT ADMIN USER ---
        from .models import User
        
        # Check if the admin user already exists
        existing_admin = User.query.filter_by(email='admin@streamforge.com').first()
        
        if not existing_admin:
            print("Creating default admin user: admin@streamforge.com / admin123")
            # Create the admin user
            admin = User(
                username='Admin',
                email='admin@streamforge.com',
                password_hash=generate_password_hash('admin123'), # Hashes the password
                is_admin=True
            )
            db.session.add(admin)
            db.session.commit()
            print("Admin user created successfully.")
        else:
            print("Admin user already exists. Skipping creation.")
        # -------------------------------

    return app