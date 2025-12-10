import os
from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager  # <--- NEW IMPORT

db = SQLAlchemy()
jwt = JWTManager()  # <--- Initialize JWT

def create_app():
    app = Flask(__name__)
    CORS(app)

    basedir = os.path.abspath(os.path.dirname(__file__))
    db_path = os.path.join(basedir, '..', 'pipelines.db')
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + db_path
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # NEW: Setup the secret key for signing tokens
    app.config['JWT_SECRET_KEY'] = 'super-secret-key-change-this-in-prod' 
    
    db.init_app(app)
    jwt.init_app(app)  # <--- Register JWT with the app

    from .routes import main
    app.register_blueprint(main)

    with app.app_context():
        db.create_all()

    return app