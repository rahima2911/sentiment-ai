import React, { useEffect, useState } from 'react';
import { sentimentAPI } from '../utils/api';

const NAV = [
  { id: 'analyze', label: 'Analyze' },
  { id: 'history', label: 'History' },
];

export default function Header({ page, setPage }) {
  const [online, setOnline] = useState(null);

  useEffect(() => {
    const check = async () => {
      try { await sentimentAPI.health(); setOnline(true); }
      catch { setOnline(false); }
    };
    check();
    const id = setInterval(check, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <header style={{
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg)',
      position: 'sticky', top: 0, zIndex: 50,
    }}>
      <div style={{
        maxWidth: 860, margin: '0 auto', padding: '0 20px',
        height: 56, display: 'flex', alignItems: 'center', gap: 24,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6,
            background: 'var(--blue-bg)', border: '1px solid rgba(88,166,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14,
          }}>🧠</div>
          <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text)', letterSpacing: '-0.01em' }}>
            SentimentAI
          </span>
        </div>

        {/* Nav */}
        <nav style={{ display: 'flex', gap: 2 }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => setPage(n.id)} style={{
              padding: '5px 12px', borderRadius: 6, border: 'none',
              background: page === n.id ? 'var(--surface2)' : 'transparent',
              color: page === n.id ? 'var(--text)' : 'var(--text2)',
              fontSize: 13, fontWeight: 500,
              transition: 'all 0.15s',
            }}>{n.label}</button>
          ))}
        </nav>

        {/* Status */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: online === null ? 'var(--text3)' : online ? 'var(--pos)' : 'var(--neg)',
            animation: online ? 'pulse 2s infinite' : 'none',
          }} />
          <span style={{ fontSize: 12, color: 'var(--text2)' }}>
            {online === null ? 'Connecting' : online ? 'API Online' : 'API Offline'}
          </span>
        </div>
      </div>
    </header>
  );
}
