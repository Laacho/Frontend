import { apiClient } from './client';

export const adminApi = {
  sendNotification: async (data: { userId: string; title: string; message: string }): Promise<void> => {
    await apiClient.post('/admin/notifications/send', data);
  },

  bulkNotification: async (data: { userIds: string[]; title: string; message: string }): Promise<void> => {
    await apiClient.post('/admin/notifications/bulk', data);
  },

  broadcastNotification: async (data: { title: string; message: string }): Promise<void> => {
    await apiClient.post('/admin/notifications/broadcast', data);
  },

  getAllUsers: async (): Promise<unknown[]> => {
    const response = await apiClient.get('/admin/users');
    return response.data;
  },
};
