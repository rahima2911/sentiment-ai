# SentimentAI

A web app that analyzes text and tells you whether it's positive, negative, or neutral. It also picks up on sarcasm and mixed feelings in text — something most basic tools miss.

Built with React on the frontend and Python Flask on the backend. The model uses a combination of TF-IDF with Logistic Regression and VADER scoring.

---

## How to Run

You need two terminals open at the same time.

**Terminal 1 — Start the backend**

```bash
cd sentiment-app/backend
pip3 install -r requirements.txt
python3 app.py
```

**Terminal 2 — Start the frontend**

```bash
cd sentiment-app/frontend
npm install
npm start
```

The app will open at `http://localhost:3000`. The backend runs on `http://localhost:5000`.

---

## Tech Used

- React 18
- Python Flask
- Scikit-Learn (Logistic Regression + TF-IDF)
- NLTK and VADER

---

## Common Issues

**"API Offline" showing** — make sure the Flask backend is running in Terminal 1.

**ModuleNotFoundError** — run `pip3 install -r requirements.txt` again.

**npm install fails** — delete the `node_modules` folder and run `npm install` again.

**NLTK error** — run this once: `python3 -c "import nltk; nltk.download('all')"`
