import React, { useState } from 'react';
import Header from './components/Header';
import AnalyzePage from './pages/AnalyzePage';
import HistoryPage from './pages/HistoryPage';
import './index.css';

export default function App() {
  const [page, setPage] = useState('analyze');
  const [tick, setTick]  = useState(0);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header page={page} setPage={setPage} />
      <main style={{ flex: 1, maxWidth: 860, width: '100%', margin: '0 auto', padding: '32px 20px 60px' }}>
        {page === 'analyze' && <AnalyzePage onDone={() => setTick(t => t + 1)} />}
        {page === 'history' && <HistoryPage tick={tick} />}
      </main>
    </div>
  );
}
