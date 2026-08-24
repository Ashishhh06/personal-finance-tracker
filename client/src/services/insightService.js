import api from './api';

export const getInsights = (module) => api.get('/insights', { params: { module } });
export const generateInsight = () => api.post('/insights/generate');
export const generateGoalInsight = (goalId) => api.post(`/insights/goals/${goalId}/generate`);