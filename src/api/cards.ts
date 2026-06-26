import { apiClient } from './client';
import { CardResponse, CardTransactionResponse, Page } from '../types';

export const cardsApi = {
  list: async (page = 0, size = 20): Promise<Page<CardResponse>> => {
    const response = await apiClient.get('/cards', { params: { page, size } });
    return response.data;
  },

  get: async (id: string): Promise<CardResponse> => {
    const response = await apiClient.get(`/cards/${id}`);
    return response.data;
  },

  create: async (data: { accountId: string; cardType: string; pin: string }): Promise<CardResponse> => {
    const response = await apiClient.post('/cards', data);
    return response.data;
  },

  updateStatus: async (id: string, status: string, reason: string, pin: string): Promise<CardResponse> => {
    const response = await apiClient.patch(`/cards/${id}/status`, { status, reason, pin });
    return response.data;
  },

  changePin: async (id: string, oldPin: string | null, newPin: string): Promise<CardResponse> => {
    const response = await apiClient.put(`/cards/${id}/pin`, { oldPin, newPin });
    return response.data;
  },

  updateLimits: async (id: string, limits: { dailyLimit: number; monthlyLimit: number; singleTransactionLimit: number }): Promise<CardResponse> => {
    const response = await apiClient.put(`/cards/${id}/limits`, limits);
    return response.data;
  },

  getTransactions: async (cardId: string, page = 0, size = 20): Promise<Page<CardTransactionResponse>> => {
    const response = await apiClient.get(`/cards/${cardId}/transactions`, { params: { page, size } });
    return response.data;
  },
};
