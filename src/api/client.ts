import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = '/api/v1';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Decode a JWT and decide if it is expired (with a small skew so we refresh
// just before the server would reject it).
function isExpired(token: string): boolean {
  try {
    const payload = JSON.parse(
      atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
    );
    if (!payload.exp) return false;
    return Date.now() >= payload.exp * 1000 - 10_000; // refresh 10s early
  } catch {
    return true; // unparseable token = treat as expired
  }
}

function clearTokens() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

// Hard redirect to login. Used when there is no way to recover the session.
function forceLogin() {
  clearTokens();
  if (window.location.pathname !== '/login') {
    window.location.replace('/login');
  }
}

// ── Single-flight refresh ───────────────────────────────────────────────
// Many requests can fail/expire at once; only one refresh call runs, the rest
// wait for its result.
let isRefreshing = false;
let waiters: Array<(token: string | null) => void> = [];

function notifyWaiters(token: string | null) {
  waiters.forEach(w => w(token));
  waiters = [];
}

async function doRefresh(): Promise<string | null> {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return null;
  try {
    // Bare axios (no interceptor) to avoid recursion.
    const res = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
    const { accessToken, refreshToken: newRefresh } = res.data;
    if (!accessToken) return null;
    localStorage.setItem('accessToken', accessToken);
    if (newRefresh) localStorage.setItem('refreshToken', newRefresh);
    return accessToken;
  } catch {
    return null; // refresh token expired/invalid
  }
}

async function getFreshToken(): Promise<string | null> {
  if (isRefreshing) {
    return new Promise(resolve => waiters.push(resolve));
  }
  isRefreshing = true;
  const token = await doRefresh();
  isRefreshing = false;
  notifyWaiters(token);
  return token;
}

// ── Request interceptor: attach token, refresh proactively if expired ────
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    let accessToken = localStorage.getItem('accessToken');

    if (accessToken && isExpired(accessToken)) {
      accessToken = await getFreshToken();
    }

    // No usable token (missing, or refresh failed) — don't fire an unauthenticated
    // request that comes back as a confusing 403; send the user to login instead.
    if (!accessToken) {
      forceLogin();
      return Promise.reject(new axios.Cancel('Not authenticated'));
    }

    if (config.headers) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: on auth failure, refresh once and retry ────────
// Backend returns 401 for expired/invalid token and 403 for missing token —
// treat both as "auth failed".
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;
    const status = error.response?.status;

    if ((status === 401 || status === 403) && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      const token = await getFreshToken();
      if (!token) {
        forceLogin();
        return Promise.reject(error);
      }

      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers['Authorization'] = `Bearer ${token}`;
      return apiClient(originalRequest);
    }

    return Promise.reject(error);
  }
);

export function getApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message || 'Something went wrong';
  }
  return 'Something went wrong';
}