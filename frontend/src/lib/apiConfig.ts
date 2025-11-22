const viteEnv = typeof import.meta !== 'undefined'
  ? (import.meta as unknown as { env?: Record<string, string> }).env
  : undefined;

export const API_BASE_URL =
  viteEnv?.VITE_API_BASE ||
  (typeof process !== 'undefined' ? process.env.API_BASE_URL : undefined) ||
  'http://localhost:5000/api';

export default API_BASE_URL;
