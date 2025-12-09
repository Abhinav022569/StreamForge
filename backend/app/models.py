from . import db

class Pipeline(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    structure = db.Column(db.Text, nullable=False) # Stores JSON string