import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error || error.message || 'Network error occurred';
    return Promise.reject(new Error(message));
  }
);

export const sentimentAPI = {
  analyze: (text) => api.post('/sentiment/analyze', { text }),
  batchAnalyze: (texts) => api.post('/sentiment/batch', { texts }),
  getHistory: (limit = 20) => api.get(`/sentiment/history?limit=${limit}`),
  clearHistory: () => api.delete('/sentiment/history'),
  getStats: () => api.get('/sentiment/stats'),
  retrain: () => api.post('/sentiment/retrain'),
  health: () => api.get('/health'),
};

export default api;
