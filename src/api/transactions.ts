import { apiClient } from './client';
import { TransactionResponse, ScheduledTransactionResponse, Page, TransferRequest, CardPaymentRequest, ScheduledRequest } from '../types';

export const transactionsApi = {
  list: async (page = 0, size = 20, params?: Record<string, string>): Promise<Page<TransactionResponse>> => {
    const response = await apiClient.get('/transactions', { params: { page, size, ...params } });
    return response.data;
  },

  get: async (id: string): Promise<TransactionResponse> => {
    const response = await apiClient.get(`/transactions/${id}`);
    return response.data;
  },

  transfer: async (data: TransferRequest, idempotencyKey: string): Promise<TransactionResponse> => {
    const response = await apiClient.post('/transactions/transfer', data, {
      headers: { 'Idempotency-Key': idempotencyKey },
    });
    return response.data;
  },

  cardPayment: async (data: CardPaymentRequest, idempotencyKey: string): Promise<TransactionResponse> => {
    const response = await apiClient.post('/transactions/card-payment', data, {
      headers: { 'Idempotency-Key': idempotencyKey },
    });
    return response.data;
  },

  createScheduled: async (data: ScheduledRequest): Promise<ScheduledTransactionResponse> => {
    const response = await apiClient.post('/transactions/scheduled', data);
    return response.data;
  },

  listScheduled: async (page = 0, size = 20): Promise<Page<ScheduledTransactionResponse>> => {
    const response = await apiClient.get('/transactions/scheduled', { params: { page, size } });
    return response.data;
  },

  getScheduled: async (id: string): Promise<ScheduledTransactionResponse> => {
    const response = await apiClient.get(`/transactions/scheduled/${id}`);
    return response.data;
  },

  updateScheduled: async (id: string, data: { status?: string; amount?: number }): Promise<ScheduledTransactionResponse> => {
    const response = await apiClient.patch(`/transactions/scheduled/${id}`, data);
    return response.data;
  },

  deleteScheduled: async (id: string): Promise<void> => {
    await apiClient.delete(`/transactions/scheduled/${id}`);
  },
};
