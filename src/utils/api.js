import { supabase } from './supabase';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function apiUrl(path) {
  return `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;
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
