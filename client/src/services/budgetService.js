import api from './api';

export const getBudgets = (month, year) => api.get('/budgets', { params: { month, year } });
export const getBudgetStatus = (month, year) => api.get('/budgets/status', { params: { month, year } });
export const getBudgetHistory = (months) => api.get('/budgets/history', { params: { months } });
export const createBudget = (data) => api.post('/budgets', data);
export const updateBudget = (id, data) => api.put(`/budgets/${id}`, data);
export const deleteBudget = (id) => api.delete(`/budgets/${id}`);