import { apiClient } from './client';
import { UserSettingsResponse } from '../types';

export const settingsApi = {
  get: async (): Promise<UserSettingsResponse> => {
    const response = await apiClient.get('/settings');
    return response.data;
  },

  update: async (data: Partial<UserSettingsResponse>): Promise<UserSettingsResponse> => {
    const response = await apiClient.put('/settings', data);
    return response.data;
  },
};
