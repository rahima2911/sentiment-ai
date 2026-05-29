#!/bin/bash
echo ""
echo "========================================="
echo "  SentimentAI — Backend"
echo "  http://localhost:5000"
echo "========================================="
cd "$(dirname "$0")"
pip3 install -r requirements.txt -q
python3 -c "import nltk; [nltk.download(p,quiet=True) for p in ['vader_lexicon','punkt','stopwords','wordnet']]"
echo ""
python3 app.py
