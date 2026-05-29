import os, re, pickle
import numpy as np
import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

for pkg in ['vader_lexicon','punkt','stopwords','wordnet']:
    nltk.download(pkg, quiet=True)

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'sentiment_model.pkl')
sia = SentimentIntensityAnalyzer()

# ── Sarcasm / backhanded phrase patterns ──────────────────────────────────────
SARCASM_PATTERNS = [
    r'\bgreat job\b.{0,40}\b(break|broke|ruin|destroy|mess|crash|fail|wrong|mistake|error)',
    r'\bimpressed\b.{0,40}\b(without|no major|not mess|not ruin|not fail)',
    r'\bconfidence\b.{0,30}\bwrong\b',
    r'\bnice work\b.{0,40}\b(break|ruin|mess|wrong|fail)',
    r'\bwell done\b.{0,40}\b(break|ruin|mess|wrong|fail)',
    r'\btalent for\b.{0,30}\b(break|ruin|mess|wrong|fail)',
    r'\bat least\b.{0,40}\b(tried|attempt)',
    r'\bfor once\b',
    r'\bsurprisingl',
    r'\bmiracle\b.{0,20}\b(you|he|she|they)',
    r'\bshock(ed|ing)\b.{0,20}\b(you|he|she|they)',
    r'\beven when you.{0,20}wrong',
    r'\bwithout.{0,20}(mess|ruin|break|fail)',
]

MIXED_PATTERNS = [
    r'\b(good|great|nice|love|like|enjoy).{0,50}\b(but|however|although|though|except|unfortunately)',
    r'\b(but|however|although|though).{0,50}\b(bad|terrible|awful|poor|disappoint|unfortunate)',
    r'\bcreative\b.{0,30}\b(but|however|though)',
    r'\bpotential\b.{0,30}\b(but|however|though)',
]

def detect_sarcasm(text):
    t = text.lower()
    for p in SARCASM_PATTERNS:
        if re.search(p, t):
            return True
    return False

def detect_mixed(text):
    t = text.lower()
    for p in MIXED_PATTERNS:
        if re.search(p, t):
            return True
    return False

def preprocess(text):
    t = text.lower()
    t = re.sub(r'http\S+', '', t)
    t = re.sub(r'[^a-z\s]', ' ', t)
    t = re.sub(r'\s+', ' ', t).strip()
    return t

# ── Comprehensive training data ───────────────────────────────────────────────
TRAINING = [
    # POSITIVE
    ("This product is absolutely amazing and I love it", "positive"),
    ("Fantastic experience, highly recommend to everyone", "positive"),
    ("Outstanding quality, exceeded all my expectations", "positive"),
    ("I am extremely happy with this purchase, works perfectly", "positive"),
    ("Best decision ever, totally worth every penny", "positive"),
    ("Excellent service and wonderful product quality", "positive"),
    ("This is incredible, I am so satisfied with the results", "positive"),
    ("Great performance, very reliable and efficient", "positive"),
    ("I love how well this works, absolutely brilliant", "positive"),
    ("Superb quality and fast delivery, very impressed", "positive"),
    ("Perfect product, exactly what I needed", "positive"),
    ("Five stars all the way, could not be happier", "positive"),
    ("Brilliant product that delivers on all its promises", "positive"),
    ("Beautiful design and great user experience", "positive"),
    ("Your idea is creative and could really help the team grow", "positive"),
    ("I really appreciate your effort on this project", "positive"),
    ("The team did an outstanding job this quarter", "positive"),
    ("What a wonderful presentation you gave today", "positive"),
    ("You have a real talent for solving complex problems", "positive"),
    ("The design looks stunning and works flawlessly", "positive"),
    ("Genuinely impressed with the quality of this work", "positive"),
    ("This feature is exactly what our users needed", "positive"),
    ("The results speak for themselves, truly exceptional", "positive"),
    ("I am thrilled with how this turned out", "positive"),
    ("This made my day so much better, thank you", "positive"),
    ("Absolutely delighted with this outcome", "positive"),
    ("The support team was incredibly helpful", "positive"),
    ("This works like a charm, smooth and efficient", "positive"),
    ("Remarkable improvement from the last version", "positive"),
    ("You nailed it, this is exactly right", "positive"),

    # NEGATIVE
    ("This product is terrible and completely disappointing", "negative"),
    ("Worst purchase ever, total waste of money", "negative"),
    ("Absolutely horrible quality, broke after one day", "negative"),
    ("Very dissatisfied with this product and service", "negative"),
    ("Complete garbage, does not work as advertised", "negative"),
    ("Extremely poor quality and terrible customer support", "negative"),
    ("I hate this product, it is absolutely useless", "negative"),
    ("Terrible experience, nothing worked correctly", "negative"),
    ("This is a scam, complete waste of time and money", "negative"),
    ("Awful product with zero quality control", "negative"),
    ("The worst thing I have ever bought", "negative"),
    ("Deeply disappointed and very frustrated with this", "negative"),
    ("Horrible experience, do not waste your money", "negative"),
    ("Zero stars if possible, absolutely dreadful", "negative"),
    ("You completely broke the entire system before the demo", "negative"),
    ("This is a disaster, everything is wrong", "negative"),
    ("Failed to meet even the most basic requirements", "negative"),
    ("The website crashed because of your negligence", "negative"),
    ("You ruined the presentation with your mistakes", "negative"),
    ("This decision has made everything worse", "negative"),
    ("Totally unprofessional and unacceptable behavior", "negative"),
    ("The code is a mess and breaks constantly", "negative"),
    ("Nothing works and no one seems to care", "negative"),
    ("This has caused serious problems for the whole team", "negative"),
    ("Complete failure on every front, unbelievable", "negative"),
    ("I am furious about how this was handled", "negative"),
    ("The quality is shockingly bad for the price", "negative"),
    ("Defective product, company refused to help", "negative"),
    ("Never buying from this brand again", "negative"),
    ("This ruined my entire day, absolutely terrible", "negative"),

    # NEUTRAL
    ("The product arrived on time and works as described", "neutral"),
    ("It does what it says, nothing more nothing less", "neutral"),
    ("Average quality for the price paid", "neutral"),
    ("The item is okay but nothing special", "neutral"),
    ("Neither impressed nor disappointed with this", "neutral"),
    ("The food was okay, nothing special but not terrible either", "neutral"),
    ("Standard product with typical features", "neutral"),
    ("It functions adequately for basic tasks", "neutral"),
    ("Reasonable product at a reasonable price", "neutral"),
    ("The meeting went as planned, nothing unusual", "neutral"),
    ("The report was submitted on the expected date", "neutral"),
    ("The update includes minor changes to the interface", "neutral"),
    ("It is an average product with expected performance", "neutral"),
    ("The delivery was on schedule", "neutral"),
    ("The package arrived intact", "neutral"),
    ("The software does the basic tasks without issues", "neutral"),
    ("It is a standard item with average quality", "neutral"),
    ("Normal experience, nothing out of the ordinary", "neutral"),
    ("The documentation covers the main features", "neutral"),
    ("The app loads within expected time", "neutral"),
    ("This is fine for everyday use", "neutral"),
    ("Nothing exceptional, but gets the job done", "neutral"),
    ("The results are within the expected range", "neutral"),
    ("The team completed the assigned tasks", "neutral"),
    ("The product is acceptable for the price", "neutral"),

    # POSITIVE — creative/helpful framing
    ("Your idea is creative and could really help the team grow", "positive"),
    ("This idea is innovative and will greatly benefit the team", "positive"),
    ("That is a creative solution that could make a real difference", "positive"),
    ("Your suggestions are excellent and will help us improve", "positive"),
    ("The concept is brilliant and has real potential to help", "positive"),
    ("This approach is clever and will definitely benefit everyone", "positive"),

    # SARCASTIC → NEGATIVE
    ("Great job breaking the website right before the meeting", "negative"),
    ("Wow, brilliant move deleting the production database", "negative"),
    ("Oh fantastic, another bug you introduced to the codebase", "negative"),
    ("Sure, because crashing the server was a great idea", "negative"),
    ("What a genius plan, now nothing works at all", "negative"),
    ("Oh wonderful, you managed to break everything again", "negative"),
    ("Great, just what we needed right before the deadline", "negative"),
    ("Amazing how you always find new ways to cause problems", "negative"),
    ("Impressive how thoroughly you managed to break things", "negative"),
    ("Well done on ruining the demo right before the client arrived", "negative"),

    # BACKHANDED / MIXED
    ("I like your confidence, even when you're completely wrong", "negative"),
    ("Impressive you completed it without any major mistakes this time", "negative"),
    ("I'm impressed you managed to finish without messing it up", "negative"),
    ("Not bad, for someone with your track record", "negative"),
    ("You actually did something right for once", "negative"),
    ("Surprisingly, you did not break anything this time", "negative"),
    ("It's a miracle you finished before the deadline", "negative"),
    ("You almost got it right, which is unusual for you", "negative"),
    ("For once you managed to deliver on time", "negative"),
    ("Shocked you pulled this off without any issues", "negative"),

    # MIXED GENUINE
    ("The design looks great but the performance is really poor", "neutral"),
    ("Good start but there are significant issues to fix", "neutral"),
    ("I liked some parts but overall it was disappointing", "neutral"),
    ("Creative idea but the execution needs a lot of work", "neutral"),
    ("Has potential but currently not ready for production", "neutral"),
    ("Interesting concept but the implementation is flawed", "neutral"),
    ("Good effort but the results are below expectations", "neutral"),
    ("Nice interface but the backend crashes frequently", "neutral"),
    ("The product has its strengths but also many weaknesses", "neutral"),
    ("Some features work well while others are completely broken", "neutral"),
]

def train_model():
    texts, labels = zip(*TRAINING)
    processed = [preprocess(t) for t in texts]

    X_train, X_test, y_train, y_test = train_test_split(
        processed, labels, test_size=0.15, random_state=42, stratify=labels
    )

    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(
            max_features=8000, ngram_range=(1, 4),
            min_df=1, sublinear_tf=True, analyzer='word'
        )),
        ('clf', LogisticRegression(C=2.0, max_iter=2000, random_state=42, solver='lbfgs'))
    ])
    pipeline.fit(X_train, y_train)
    acc = accuracy_score(y_test, pipeline.predict(X_test))
    print(f"Model accuracy: {acc:.2%}")
    with open(MODEL_PATH, 'wb') as f:
        pickle.dump(pipeline, f)
    return pipeline, acc

def load_model():
    if os.path.exists(MODEL_PATH):
        with open(MODEL_PATH, 'rb') as f:
            return pickle.load(f)
    model, _ = train_model()
    return model

def analyze_sentiment(text):
    if not text or len(text.strip()) < 2:
        return {'error': 'Text too short', 'sentiment': 'neutral', 'confidence': 0,
                'scores': {'positive':33,'negative':33,'neutral':34}, 'vader_scores': {}}

    model = load_model()
    vader = sia.polarity_scores(text)
    processed = preprocess(text)

    # ML scores
    proba = model.predict_proba([processed])[0]
    classes = list(model.classes_)
    ml = {c: float(p) for c, p in zip(classes, proba)}

    # VADER scores
    compound = vader['compound']
    v = {
        'positive': max(0, compound) * 0.8 + vader['pos'] * 0.2 if compound > 0 else vader['pos'] * 0.3,
        'negative': abs(min(0, compound)) * 0.8 + vader['neg'] * 0.2 if compound < 0 else vader['neg'] * 0.3,
        'neutral':  vader['neu'],
    }
    vt = sum(v.values()) or 1
    v = {k: val/vt for k, val in v.items()}

    # Combine
    combined = {s: ml.get(s,0)*0.60 + v.get(s,0)*0.40 for s in ['positive','negative','neutral']}

    # Sarcasm override — strong signal
    if detect_sarcasm(text):
        combined['negative'] = max(combined['negative'], 0.65)
        combined['positive'] *= 0.2
        combined['neutral']  *= 0.5

    # Normalize
    total = sum(combined.values()) or 1
    combined = {k: val/total for k, val in combined.items()}

    sentiment = max(combined, key=combined.get)
    confidence = combined[sentiment] * 100

    intensity = 'Very Strong' if confidence > 85 else 'Strong' if confidence > 70 else 'Moderate' if confidence > 55 else 'Weak'
    is_sarcastic = detect_sarcasm(text)
    is_mixed = detect_mixed(text)

    return {
        'sentiment': sentiment,
        'confidence': round(confidence, 2),
        'scores': {k: round(v*100, 2) for k, v in combined.items()},
        'vader_scores': {
            'pos': round(vader['pos']*100, 2),
            'neg': round(vader['neg']*100, 2),
            'neu': round(vader['neu']*100, 2),
            'compound': round(compound, 4),
        },
        'intensity': intensity,
        'is_sarcastic': is_sarcastic,
        'is_mixed': is_mixed,
        'word_count': len(text.split()),
        'char_count': len(text),
    }

# Auto-init
print("Loading model...")
try:
    if not os.path.exists(MODEL_PATH):
        train_model()
    else:
        load_model()
    print("Model ready.")
except Exception as e:
    print(f"Model init error: {e}")
