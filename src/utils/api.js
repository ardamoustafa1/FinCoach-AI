export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function apiUrl(path) {
  return `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
