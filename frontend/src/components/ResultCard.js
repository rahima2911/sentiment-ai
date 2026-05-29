import React from 'react';

const CFG = {
  positive: { label: 'Positive', color: 'var(--pos)', bg: 'var(--pos-bg)', border: 'var(--pos-border)', emoji: '😊' },
  negative: { label: 'Negative', color: 'var(--neg)', bg: 'var(--neg-bg)', border: 'var(--neg-border)', emoji: '😞' },
  neutral:  { label: 'Neutral',  color: 'var(--neu)', bg: 'var(--neu-bg)', border: 'var(--neu-border)', emoji: '😐' },
};

function Bar({ label, value, color }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 12, color: 'var(--text2)' }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color }}>{value.toFixed(1)}%</span>
      </div>
      <div style={{ height: 5, background: 'var(--border2)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${value}%`, background: color, borderRadius: 3,
          transition: 'width 0.7s cubic-bezier(0.4,0,0.2,1)',
        }} />
      </div>
    </div>
  );
}

export default function ResultCard({ result }) {
  if (!result) return null;
  const cfg = CFG[result.sentiment] || CFG.neutral;
  const s = result.scores || {};
  const vader = result.vader_scores || {};

  return (
    <div className="fade-up" style={{
      border: `1px solid ${cfg.border}`,
      background: cfg.bg,
      borderRadius: var_radius_lg(),
      padding: 24,
      marginTop: 16,
    }}>
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 32 }}>{cfg.emoji}</span>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: cfg.color, letterSpacing: '-0.02em' }}>
              {cfg.label}
              {result.is_sarcastic && (
                <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text2)', marginLeft: 8,
                  padding: '2px 8px', background: 'var(--surface2)', borderRadius: 4, border: '1px solid var(--border2)' }}>
                  sarcasm detected
                </span>
              )}
              {result.is_mixed && !result.is_sarcastic && (
                <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text2)', marginLeft: 8,
                  padding: '2px 8px', background: 'var(--surface2)', borderRadius: 4, border: '1px solid var(--border2)' }}>
                  mixed
                </span>
              )}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 1 }}>
              {result.intensity} signal · {result.word_count} words
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 34, fontWeight: 700, color: cfg.color, lineHeight: 1, letterSpacing: '-0.03em' }}>
            {result.confidence?.toFixed(1)}%
          </div>
          <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>confidence</div>
        </div>
      </div>

      {/* Score bars */}
      <div style={{
        background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: 16,
        border: '1px solid var(--border)', marginBottom: 12,
      }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase',
          letterSpacing: '0.06em', marginBottom: 14 }}>Score Breakdown</div>
        <Bar label="Positive" value={s.positive || 0} color="var(--pos)" />
        <Bar label="Neutral"  value={s.neutral  || 0} color="var(--neu)" />
        <Bar label="Negative" value={s.negative || 0} color="var(--neg)" />
      </div>

      {/* VADER */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
        {[
          { label: 'VADER +', val: `${vader.pos?.toFixed(1)}%`, color: 'var(--pos)' },
          { label: 'VADER −', val: `${vader.neg?.toFixed(1)}%`, color: 'var(--neg)' },
          { label: 'VADER ±', val: `${vader.neu?.toFixed(1)}%`, color: 'var(--neu)' },
          { label: 'Compound', val: vader.compound?.toFixed(3),
            color: vader.compound > 0.05 ? 'var(--pos)' : vader.compound < -0.05 ? 'var(--neg)' : 'var(--neu)' },
        ].map(item => (
          <div key={item.label} style={{
            background: 'rgba(0,0,0,0.2)', borderRadius: 6, padding: '10px 12px',
            border: '1px solid var(--border)', textAlign: 'center',
          }}>
            <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase',
              letterSpacing: '0.05em', marginBottom: 4 }}>{item.label}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: item.color }}>{item.val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function var_radius_lg() { return '12px'; }
