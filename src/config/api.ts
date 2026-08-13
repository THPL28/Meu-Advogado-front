/// <reference types="vite/client" />

const rawBaseUrl = import.meta.env.VITE_API_URL || '';

export const API_CONFIG = {
  baseURL: rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  useMock: import.meta.env.VITE_USE_MOCK === 'true',
  storagePrefix: 'lwork_v2_',
};
