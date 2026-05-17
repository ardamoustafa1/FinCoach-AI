import { supabase } from './supabase';

const configuredApiUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '');
export const API_URL = configuredApiUrl || (import.meta.env.DEV ? 'http://localhost:3001' : '');

export function apiUrl(path) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return API_URL ? `${API_URL}${normalizedPath}` : normalizedPath;
}

export async function authFetch(path, options = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.body) headers.set('Content-Type', 'application/json');
  if (session?.access_token) headers.set('Authorization', `Bearer ${session.access_token}`);

  return fetch(apiUrl(path), {
    ...options,
    headers,
  });
}
