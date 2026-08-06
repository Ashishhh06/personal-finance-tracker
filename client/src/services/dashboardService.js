import api from './api';

export const getDashboardSummary = (period) =>
  api.get('/dashboard/summary', { params: { period } });