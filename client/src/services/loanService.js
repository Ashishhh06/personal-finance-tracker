import api from './api';

export const getLoans = () => api.get('/loans');
export const getLoansSummary = () => api.get('/loans/summary');
export const createLoan = (data) => api.post('/loans', data);
export const updateLoan = (id, data) => api.put(`/loans/${id}`, data);
export const deleteLoan = (id) => api.delete(`/loans/${id}`);
export const payEmi = (id) => api.post(`/loans/${id}/pay-emi`);