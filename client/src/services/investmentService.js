import api from './api';

export const getInvestments = (type) => api.get('/investments', { params: { type } });
export const getInvestmentById = (id) => api.get(`/investments/${id}`);
export const createInvestment = (data) => api.post('/investments', data);
export const updateInvestment = (id, data) => api.put(`/investments/${id}`, data);
export const deleteInvestment = (id) => api.delete(`/investments/${id}`);