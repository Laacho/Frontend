import { apiClient } from './client';
import { AccountResponse, Page } from '../types';

export const accountsApi = {
  list: async (page = 0, size = 20): Promise<Page<AccountResponse>> => {
    const response = await apiClient.get('/accounts', { params: { page, size } });
    return response.data;
  },

  get: async (id: string): Promise<AccountResponse> => {
    const response = await apiClient.get(`/accounts/${id}`);
    return response.data;
  },

  create: async (data: { accountType: string; currency: string; branchName: string }): Promise<AccountResponse> => {
    const response = await apiClient.post('/accounts', data);
    return response.data;
  },

  updateStatus: async (id: string, status: string, reason: string): Promise<AccountResponse> => {
    const response = await apiClient.patch(`/accounts/${id}/status`, { status, reason });
    return response.data;
  },
};
