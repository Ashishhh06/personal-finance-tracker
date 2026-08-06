import api from './api';

export const getGoals = () => api.get('/goals');
export const getGoalById = (id) => api.get(`/goals/${id}`);
export const getGoalsSummary = () => api.get('/goals/summary');
export const createGoal = (data) => api.post('/goals', data);
export const updateGoal = (id, data) => api.put(`/goals/${id}`, data);
export const deleteGoal = (id) => api.delete(`/goals/${id}`);