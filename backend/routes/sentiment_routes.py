from flask import Blueprint, request, jsonify
from datetime import datetime
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models.sentiment_model import analyze_sentiment, train_model

sentiment_bp = Blueprint('sentiment', __name__)

# In-memory history store (no DB)
analysis_history = []
MAX_HISTORY = 100

@sentiment_bp.route('/analyze', methods=['POST'])
def analyze():
    """Analyze sentiment of provided text."""
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({'error': 'No text provided'}), 400
        
        text = data.get('text', '').strip()
        
        if len(text) < 2:
            return jsonify({'error': 'Text too short. Please provide at least 2 characters.'}), 400
        
        if len(text) > 5000:
            return jsonify({'error': 'Text too long. Maximum 5000 characters allowed.'}), 400
        
        result = analyze_sentiment(text)
        
        # Create history entry
        history_entry = {
            'id': len(analysis_history) + 1,
            'text': text[:200] + '...' if len(text) > 200 else text,
            'full_text': text,
            'sentiment': result['sentiment'],
            'confidence': result['confidence'],
            'scores': result['scores'],
            'intensity': result['intensity'],
            'word_count': result['word_count'],
            'timestamp': datetime.now().isoformat(),
            'timestamp_display': datetime.now().strftime('%b %d, %Y %I:%M %p')
        }
        
        analysis_history.insert(0, history_entry)
        if len(analysis_history) > MAX_HISTORY:
            analysis_history.pop()
        
        return jsonify({
            'success': True,
            'result': result,
            'history_entry': history_entry
        })
    
    except Exception as e:
        return jsonify({'error': f'Analysis failed: {str(e)}'}), 500


@sentiment_bp.route('/history', methods=['GET'])
def get_history():
    """Get analysis history."""
    try:
        limit = int(request.args.get('limit', 20))
        limit = min(limit, MAX_HISTORY)
        return jsonify({
            'success': True,
            'history': analysis_history[:limit],
            'total': len(analysis_history)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@sentiment_bp.route('/history', methods=['DELETE'])
def clear_history():
    """Clear all history."""
    try:
        analysis_history.clear()
        return jsonify({'success': True, 'message': 'History cleared'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@sentiment_bp.route('/stats', methods=['GET'])
def get_stats():
    """Get overall statistics."""
    try:
        if not analysis_history:
            return jsonify({
                'success': True,
                'stats': {
                    'total': 0,
                    'positive': 0,
                    'negative': 0,
                    'neutral': 0,
                    'avg_confidence': 0,
                    'positive_pct': 0,
                    'negative_pct': 0,
                    'neutral_pct': 0
                }
            })
        
        total = len(analysis_history)
        counts = {'positive': 0, 'negative': 0, 'neutral': 0}
        confidences = []
        
        for entry in analysis_history:
            sentiment = entry.get('sentiment', 'neutral')
            if sentiment in counts:
                counts[sentiment] += 1
            confidences.append(entry.get('confidence', 0))
        
        avg_conf = sum(confidences) / len(confidences) if confidences else 0
        
        return jsonify({
            'success': True,
            'stats': {
                'total': total,
                'positive': counts['positive'],
                'negative': counts['negative'],
                'neutral': counts['neutral'],
                'avg_confidence': round(avg_conf, 2),
                'positive_pct': round((counts['positive'] / total) * 100, 1) if total > 0 else 0,
                'negative_pct': round((counts['negative'] / total) * 100, 1) if total > 0 else 0,
                'neutral_pct': round((counts['neutral'] / total) * 100, 1) if total > 0 else 0,
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@sentiment_bp.route('/retrain', methods=['POST'])
def retrain():
    """Retrain the model."""
    try:
        model, accuracy = train_model()
        return jsonify({
            'success': True,
            'message': 'Model retrained successfully',
            'accuracy': f'{accuracy:.2%}'
        })
    except Exception as e:
        return jsonify({'error': f'Retraining failed: {str(e)}'}), 500


@sentiment_bp.route('/batch', methods=['POST'])
def batch_analyze():
    """Analyze multiple texts at once."""
    try:
        data = request.get_json()
        
        if not data or 'texts' not in data:
            return jsonify({'error': 'No texts array provided'}), 400
        
        texts = data.get('texts', [])
        
        if len(texts) > 10:
            return jsonify({'error': 'Maximum 10 texts per batch'}), 400
        
        results = []
        for text in texts:
            if text and len(text.strip()) >= 2:
                result = analyze_sentiment(text.strip())
                results.append({
                    'text': text[:100] + '...' if len(text) > 100 else text,
                    'sentiment': result['sentiment'],
                    'confidence': result['confidence'],
                    'scores': result['scores']
                })
        
        return jsonify({
            'success': True,
            'results': results,
            'count': len(results)
        })
    
    except Exception as e:
        return jsonify({'error': f'Batch analysis failed: {str(e)}'}), 500
