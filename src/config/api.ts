/// <reference types="vite/client" />

export const API_CONFIG = {
  // In production, VITE_API_URL should be the Railway backend URL (e.g. https://xxx.up.railway.app)
  // In development with `npm run dev`, the vite proxy forwards /api → http://localhost:8080
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Set to false to call the real Spring Boot backend.
  // Set to true to use in-browser mock data (localStorage persistence) – useful when backend is offline.
  useMock: import.meta.env.VITE_USE_MOCK === 'true' || false,
  storagePrefix: 'lwork_v2_',
};
