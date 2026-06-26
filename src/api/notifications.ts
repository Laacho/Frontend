import { apiClient } from './client';
import { NotificationResponse, Page } from '../types';

export const notificationsApi = {
  list: async (page = 0, size = 20): Promise<Page<NotificationResponse> & { unreadCount?: number }> => {
    const response = await apiClient.get('/notifications', { params: { page, size } });
    return response.data;
  },

  get: async (id: string): Promise<NotificationResponse> => {
    const response = await apiClient.get(`/notifications/${id}`);
    return response.data;
  },

  markRead: async (id: string): Promise<NotificationResponse> => {
    const response = await apiClient.patch(`/notifications/${id}/read`);
    return response.data;
  },

  markAllRead: async (): Promise<{ updatedCount: number }> => {
    const response = await apiClient.patch('/notifications/read-all');
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/notifications/${id}`);
  },
};
