import React, { useState, useRef } from 'react';
import { sentimentAPI } from '../utils/api';
import ResultCard from '../components/ResultCard';

const EXAMPLES = [
  { label: 'Positive',  text: 'This product is absolutely amazing! Great quality and fast delivery. Highly recommend!' },
  { label: 'Negative',  text: 'Terrible experience. Broke after one day and customer service was completely useless.' },
  { label: 'Neutral',   text: 'The food was okay, nothing special but not terrible either.' },
  { label: 'Sarcastic', text: 'Great job breaking the website right before the meeting.' },
];

const Spinner = () => (
  <div style={{
    width: 14, height: 14, border: '2px solid rgba(255,255,255,0.2)',
    borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.6s linear infinite',
  }} />
);

export default function AnalyzePage({ onDone }) {
  const [text, setText]     = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const ref = useRef();

  const analyze = async () => {
    if (!text.trim()) { setError('Please enter some text.'); return; }
    setLoading(true); setError(''); setResult(null);
    try {
      const data = await sentimentAPI.analyze(text);
      setResult(data.result);
      onDone && onDone();
    } catch (e) {
      setError(e.message || 'Analysis failed. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const setExample = (t) => {
    setText(t); setResult(null); setError('');
    ref.current?.focus();
  };

  const charPct = (text.length / 5000) * 100;

  return (
    <div>
      {/* Page title */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>
          Sentiment Analysis
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text2)' }}>
          Powered by Scikit-Learn + VADER · Detects sarcasm &amp; mixed sentiment
        </p>
      </div>

      {/* Input box */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 12, overflow: 'hidden',
      }}>
        <textarea
          ref={ref}
          value={text}
          onChange={e => { if (e.target.value.length <= 5000) { setText(e.target.value); setError(''); } }}
          placeholder="Enter text to analyze… product reviews, feedback, comments, or anything."
          rows={6}
          style={{
            width: '100%', background: 'transparent', border: 'none', outline: 'none',
            color: 'var(--text)', fontSize: 14, lineHeight: 1.7, padding: '16px 16px 0',
            resize: 'none',
          }}
        />

        {/* Bottom bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 16px 12px', gap: 12,
        }}>
          {/* Char bar */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1, height: 3, background: 'var(--border2)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${charPct}%`, borderRadius: 2,
                background: charPct > 90 ? 'var(--neg)' : 'var(--border2)',
                transition: 'width 0.2s',
              }} />
            </div>
            <span style={{ fontSize: 11, color: 'var(--text3)', whiteSpace: 'nowrap' }}>
              {text.length}/5000
            </span>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {text && (
              <button onClick={() => { setText(''); setResult(null); setError(''); }} style={{
                padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border2)',
                background: 'transparent', color: 'var(--text2)', fontSize: 12,
              }}>Clear</button>
            )}
            <button onClick={analyze} disabled={loading || !text.trim()} style={{
              padding: '6px 16px', borderRadius: 6, border: 'none',
              background: loading || !text.trim() ? 'var(--surface2)' : 'var(--blue)',
              color: loading || !text.trim() ? 'var(--text3)' : 'white',
              fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 7,
              transition: 'all 0.15s', cursor: loading || !text.trim() ? 'not-allowed' : 'pointer',
            }}>
              {loading ? <><Spinner /> Analyzing…</> : 'Analyze'}
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="fade-up" style={{
          marginTop: 10, padding: '10px 14px', borderRadius: 8,
          background: 'var(--neg-bg)', border: '1px solid var(--neg-border)',
          color: 'var(--neg)', fontSize: 13,
        }}>
          {error}
        </div>
      )}

      {/* Examples */}
      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600,
          textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
          Try an example
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {EXAMPLES.map(ex => (
            <button key={ex.label} onClick={() => setExample(ex.text)} style={{
              padding: '5px 12px', borderRadius: 6,
              border: '1px solid var(--border2)', background: 'var(--surface)',
              color: 'var(--text2)', fontSize: 12, fontWeight: 500,
              transition: 'all 0.15s',
            }}
              onMouseEnter={e => { e.target.style.borderColor = 'var(--blue)'; e.target.style.color = 'var(--blue)'; }}
              onMouseLeave={e => { e.target.style.borderColor = 'var(--border2)'; e.target.style.color = 'var(--text2)'; }}
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      {/* Result */}
      {result && <ResultCard result={result} />}

      {/* Empty state */}
      {!result && !loading && (
        <div style={{
          marginTop: 32, padding: '40px 24px', textAlign: 'center',
          border: '1px dashed var(--border2)', borderRadius: 12,
          color: 'var(--text3)',
        }}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>🔍</div>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text2)', marginBottom: 6 }}>
            Results will appear here
          </div>
          <div style={{ fontSize: 12 }}>
            Enter any text above and click Analyze
          </div>
        </div>
      )}
    </div>
  );
}
