'use client';
import axios from 'axios';
import { getAccessToken, getRefreshToken, setSession, clearSession } from './token';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// Single axios instance used by every service in the app.
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  // a FormData body must keep the browser's multipart boundary — the default
  // application/json header would make the server read the upload as JSON
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

let refreshing = null;
let waiters = [];

const flush = (token, err) => {
  waiters.forEach(({ resolve, reject }) => (err ? reject(err) : resolve(token)));
  waiters = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config || {};
    const status = error?.response?.status;
    const isAuthCall = (original.url || '').includes('/auth/');

    if (status !== 401 || original._retried || isAuthCall) {
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearSession();
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
      }
      return Promise.reject(error);
    }

    original._retried = true;

    if (!refreshing) {
      refreshing = axios
        .post(`${API_URL}/auth/refresh`, { refreshToken })
        .then(({ data }) => {
          const tokens = data?.data || {};
          setSession({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
          flush(tokens.accessToken);
          return tokens.accessToken;
        })
        .catch((err) => {
          flush(null, err);
          clearSession();
          if (typeof window !== 'undefined') {
            window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
          }
          throw err;
        })
        .finally(() => { refreshing = null; });
    }

    const token = await new Promise((resolve, reject) => {
      waiters.push({ resolve, reject });
      refreshing.catch(() => {});
    });

    original.headers = original.headers || {};
    original.headers.Authorization = `Bearer ${token}`;
    return api(original);
  }
);

// Unwraps the backend envelope { success, data, message }
export const unwrap = (res) => res?.data?.data ?? res?.data;

export default api;
