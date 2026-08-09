import api from './api';

export const getBankAccounts = () => api.get('/bank-accounts');
export const getTotalBalance = () => api.get('/bank-accounts/total');
export const createBankAccount = (data) => api.post('/bank-accounts', data);
export const updateBankAccount = (id, data) => api.put(`/bank-accounts/${id}`, data);
export const deleteBankAccount = (id) => api.delete(`/bank-accounts/${id}`);