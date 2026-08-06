import api from './api';

export const getCategories = (type) => api.get('/categories', { params: { type } });