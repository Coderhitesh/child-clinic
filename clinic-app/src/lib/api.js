import axios from 'axios';
import Constants from 'expo-constants';
import { STORAGE } from './constants';
import { secureGet, secureSet, secureDelete } from './storage';

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  Constants.expoConfig?.extra?.apiUrl ||
  'http://localhost:5000/api/v1';

// ---------------------------------------------------------------- session
let accessToken = null;
let refreshToken = null;
let onSessionLost = null;

export const setOnSessionLost = (fn) => { onSessionLost = fn; };

export const loadSession = async () => {
  accessToken = await secureGet(STORAGE.ACCESS);
  refreshToken = await secureGet(STORAGE.REFRESH);
  const raw = await secureGet(STORAGE.USER);
  let user = null;
  try { user = raw ? JSON.parse(raw) : null; } catch { user = null; }
  return { accessToken, refreshToken, user };
};

export const saveSession = async ({ accessToken: at, refreshToken: rt, user }) => {
  accessToken = at ?? accessToken;
  refreshToken = rt ?? refreshToken;
  if (at) await secureSet(STORAGE.ACCESS, at);
  if (rt) await secureSet(STORAGE.REFRESH, rt);
  if (user) await secureSet(STORAGE.USER, JSON.stringify(user));
};

export const clearSession = async () => {
  accessToken = null;
  refreshToken = null;
  await Promise.all([
    secureDelete(STORAGE.ACCESS),
    secureDelete(STORAGE.REFRESH),
    secureDelete(STORAGE.USER),
  ]);
};

export const hasSession = () => Boolean(accessToken);

// ------------------------------------------------------------ the instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 20000,
  headers: { Accept: 'application/json' },
});

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  if (config.data instanceof FormData) delete config.headers['Content-Type'];
  return config;
});

// One refresh at a time; everything that 401'd waits in the queue and replays.
let refreshing = null;
let queue = [];

const flush = (error, token) => {
  queue.forEach(({ resolve, reject, config }) => {
    if (error) return reject(error);
    config.headers.Authorization = `Bearer ${token}`;
    resolve(api(config));
  });
  queue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { config, response } = error;
    const isAuthCall = config?.url?.includes('/auth/login') || config?.url?.includes('/auth/refresh');

    if (response?.status !== 401 || config?._retried || isAuthCall || !refreshToken) {
      return Promise.reject(error);
    }

    config._retried = true;

    if (refreshing) {
      return new Promise((resolve, reject) => queue.push({ resolve, reject, config }));
    }

    refreshing = axios
      .post(`${API_URL}/auth/refresh`, { refreshToken })
      .then(async ({ data }) => {
        const tokens = data?.data || {};
        await saveSession(tokens);
        flush(null, tokens.accessToken);
        return tokens.accessToken;
      })
      .catch(async (err) => {
        flush(err);
        await clearSession();
        onSessionLost?.();
        throw err;
      })
      .finally(() => { refreshing = null; });

    const token = await refreshing;
    config.headers.Authorization = `Bearer ${token}`;
    return api(config);
  }
);

// every endpoint returns { success, data, message }
export const unwrap = (res) => res.data?.data ?? res.data;

export default api;
