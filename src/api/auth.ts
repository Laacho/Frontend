import { apiClient } from './client';
import { RegisterRequest, TokenPairResponse, ValidateResponse } from '../types';
import axios from 'axios';

// Shared by SettingsPage (hover prefetch) and TwoFASetupPage (read) so the
// prefetched QR/secret is reused instead of re-fetched on navigation.
export const TWO_FA_SETUP_KEY = ['2fa-setup'];
export const TWO_FA_SETUP_STALE_MS = 5 * 60_000;

export const authApi = {
  register: async (data: RegisterRequest): Promise<TokenPairResponse> => {
    const response = await axios.post('/api/v1/users/register', data);
    return response.data;
  },

  login: async (username: string, password: string): Promise<TokenPairResponse> => {
    const response = await axios.post('/api/v1/users/login', { username, password });
    return response.data;
  },

  refresh: async (refreshToken: string): Promise<TokenPairResponse> => {
    const response = await axios.post('/api/v1/auth/refresh', { refreshToken });
    return response.data;
  },

  validate: async (token: string): Promise<ValidateResponse> => {
    const response = await axios.post('/api/v1/auth/validate', { token });
    return response.data;
  },

  setup2FA: async (): Promise<{ otpauthUrl: string; secret: string; qrImageBase64: string }> => {
    const response = await apiClient.post('/2fa/setup');
    return response.data;
  },

  verify2FA: async (code: number): Promise<{ message: string }> => {
    const response = await apiClient.post('/2fa/verify', { code });
    return response.data;
  },

  changePassword: async (oldPassword: string, newPassword: string): Promise<TokenPairResponse> => {
    const response = await apiClient.put('/users/password', { oldPassword, newPassword });
    return response.data;
  },
};
