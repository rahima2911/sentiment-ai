#!/bin/bash
echo ""
echo "========================================="
echo "  SentimentAI — Frontend"
echo "  http://localhost:3000"
echo "========================================="
cd "$(dirname "$0")"
npm install --silent
npm start
