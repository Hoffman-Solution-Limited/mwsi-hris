// Centralized API base URL. Uses Vite's env first, then process.env (for other envs), then falls back to localhost.
const viteEnv = (typeof import.meta !== 'undefined') ? (import.meta as unknown as { env?: Record<string, string> }).env : undefined;

export const API_BASE_URL = (
  // Vite first
  viteEnv?.VITE_API_BASE_URL
) || (typeof process !== 'undefined' ? (process.env.REACT_APP_API_BASE_URL || process.env.API_BASE_URL) : undefined) || 'http://localhost:5000/api';

export default API_BASE_URL;
