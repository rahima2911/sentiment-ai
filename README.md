# SentimentAI

Real-time NLP sentiment analysis — Positive / Negative / Neutral.  
Detects **sarcasm** and **mixed sentiment** automatically.

---

## Tech Stack
- **Frontend** — React 18, Axios
- **Backend** — Python Flask, Flask-CORS  
- **ML Model** — Scikit-Learn (Logistic Regression + TF-IDF)
- **NLP** — NLTK VADER (hybrid scoring)

---

## Setup — VS Code (2 terminals)

### Terminal 1 — Backend

```bash
cd sentiment-app/backend
pip3 install -r requirements.txt
python3 app.py
```

Runs on **http://localhost:5000**

---

### Terminal 2 — Frontend

```bash
cd sentiment-app/frontend
npm install
npm start
```

Opens **http://localhost:3000** automatically

---

## API Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| GET  | `/api/health` | Health check |
| POST | `/api/sentiment/analyze` | Analyze single text |
| POST | `/api/sentiment/batch` | Analyze up to 10 texts |
| GET  | `/api/sentiment/history` | Get history |
| DELETE | `/api/sentiment/history` | Clear history |
| GET  | `/api/sentiment/stats` | Statistics |
| POST | `/api/sentiment/retrain` | Retrain model |

### Example

```bash
curl -X POST http://localhost:5000/api/sentiment/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "Great job breaking the website before the meeting."}'
```

```json
{
  "result": {
    "sentiment": "negative",
    "confidence": 75.6,
    "is_sarcastic": true,
    "intensity": "Strong",
    "scores": { "positive": 8.2, "negative": 75.6, "neutral": 16.2 }
  }
}
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `ModuleNotFoundError` | `pip3 install -r requirements.txt` |
| "API Offline" shown | Make sure Flask is running on port 5000 |
| `npm install` fails | Delete `node_modules/`, run `npm install` again |
| NLTK error | `python3 -c "import nltk; nltk.download('all')"` |

---

*SentimentAI — React + Flask + Scikit-Learn*
