from flask import Flask, jsonify
from flask_cors import CORS
import os
import sys

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

app = Flask(__name__)

# Enable CORS for React frontend
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],
        "methods": ["GET", "POST", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Register blueprints
from routes.sentiment_routes import sentiment_bp
app.register_blueprint(sentiment_bp, url_prefix='/api/sentiment')

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'message': 'SentimentAI API is running',
        'version': '1.0.0'
    })

@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Route not found'}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    print("\n" + "="*50)
    print("  SentimentAI Backend Server")
    print("  Running on: http://localhost:5000")
    print("  API Base: http://localhost:5000/api")
    print("="*50 + "\n")
    app.run(debug=True, host='0.0.0.0', port=5000)
