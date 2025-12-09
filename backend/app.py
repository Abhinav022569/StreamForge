from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # This lets React talk to Flask

@app.route('/', methods=['GET'])
def home():
    return jsonify({"message": "The ETL Engine is Online!"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)