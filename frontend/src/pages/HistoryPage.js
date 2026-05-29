import React, { useState, useEffect } from 'react';
import { sentimentAPI } from '../utils/api';

const CFG = {
  positive: { color: 'var(--pos)', bg: 'var(--pos-bg)', border: 'var(--pos-border)', emoji: '😊' },
  negative: { color: 'var(--neg)', bg: 'var(--neg-bg)', border: 'var(--neg-border)', emoji: '😞' },
  neutral:  { color: 'var(--neu)', bg: 'var(--neu-bg)', border: 'var(--neu-border)', emoji: '😐' },
};

const FILTERS = ['all','positive','negative','neutral'];

const Spinner = () => (
  <div style={{
    width: 20, height: 20, borderRadius: '50%',
    border: '2px solid var(--border2)', borderTopColor: 'var(--text2)',
    animation: 'spin 0.7s linear infinite', margin: '40px auto',
  }} />
);

export default function HistoryPage({ tick }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('all');
  const [error, setError]     = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const d = await sentimentAPI.getHistory(50);
      setHistory(d.history || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [tick]);

  const clear = async () => {
    if (!window.confirm('Clear all history?')) return;
    await sentimentAPI.clearHistory();
    setHistory([]);
  };

  const counts = FILTERS.reduce((acc, f) => {
    acc[f] = f === 'all' ? history.length : history.filter(h => h.sentiment === f).length;
    return acc;
  }, {});

  const list = filter === 'all' ? history : history.filter(h => h.sentiment === filter);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>History</h1>
          <p style={{ fontSize: 13, color: 'var(--text2)' }}>{history.length} total analyses</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={load} style={{
            padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border2)',
            background: 'transparent', color: 'var(--text2)', fontSize: 12,
          }}>Refresh</button>
          {history.length > 0 && (
            <button onClick={clear} style={{
              padding: '6px 12px', borderRadius: 6, border: '1px solid var(--neg-border)',
              background: 'var(--neg-bg)', color: 'var(--neg)', fontSize: 12,
            }}>Clear All</button>
          )}
        </div>
      </div>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {FILTERS.map(f => {
          const active = filter === f;
          const cfg = CFG[f];
          return (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
              border: active && f !== 'all' ? `1px solid ${cfg?.border}` : '1px solid var(--border2)',
              background: active && f !== 'all' ? cfg?.bg : active ? 'var(--surface2)' : 'transparent',
              color: active && f !== 'all' ? cfg?.color : active ? 'var(--text)' : 'var(--text2)',
              transition: 'all 0.15s',
            }}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
              <span style={{
                marginLeft: 6, padding: '0 5px', borderRadius: 10, fontSize: 10,
                background: 'rgba(255,255,255,0.06)', color: 'var(--text3)',
              }}>{counts[f]}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? <Spinner /> : error ? (
        <div style={{ color: 'var(--neg)', fontSize: 13, padding: 20, textAlign: 'center' }}>
          {error} <button onClick={load} style={{ marginLeft: 8, color: 'var(--blue)', background: 'none', border: 'none', fontSize: 13 }}>Retry</button>
        </div>
      ) : list.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text3)', fontSize: 14 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📭</div>
          {history.length === 0 ? 'No analyses yet. Go to Analyze to get started.' : 'No results for this filter.'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {list.map((entry, i) => {
            const cfg = CFG[entry.sentiment] || CFG.neutral;
            return (
              <div key={entry.id} className="fade-up" style={{
                animationDelay: `${Math.min(i * 30, 200)}ms`,
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '12px 16px',
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 10, transition: 'border-color 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border2)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <span style={{ fontSize: 20, flexShrink: 0 }}>{cfg.emoji}</span>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13, color: 'var(--text)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    marginBottom: 2,
                  }}>{entry.text}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>{entry.timestamp_display}</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  <span style={{
                    padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                    background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
                    textTransform: 'capitalize',
                  }}>{entry.sentiment}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: cfg.color, minWidth: 46, textAlign: 'right' }}>
                    {entry.confidence?.toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
