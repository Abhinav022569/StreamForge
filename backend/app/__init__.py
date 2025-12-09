import os
from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    CORS(app)

    # Database Configuration
    basedir = os.path.abspath(os.path.dirname(__file__))
    # Go up one level to store db in the root backend folder, not inside app/
    db_path = os.path.join(basedir, '..', 'pipelines.db')
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + db_path
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)

    # Import and Register Routes
    from .routes import main
    app.register_blueprint(main)

    # Create Tables if they don't exist
    with app.app_context():
        db.create_all()

    return app