import { getAssetPath } from '../utils/assetPath';

export type Item = Record<string, unknown> & { id?: string };

let csrf = '';

export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  if (init.method && init.method !== 'GET') headers.set('X-CSRF-Token', csrf);
  if (typeof init.body === 'string') headers.set('Content-Type', 'application/json');
  const response = await fetch(getAssetPath(`/api/${path}`), { ...init, headers, credentials: 'same-origin', cache: 'no-store' });
  let data: any = null;
  try { data = await response.json(); } catch { /* not JSON */ }
  if (!response.ok) {
    const fallback = response.status === 404 ? 'The admin API was not found on this server.' : `Request failed (${response.status}).`;
    throw new ApiError(data?.error || fallback, response.status);
  }
  return data as T;
}

export async function getSession(): Promise<string | null> {
  const data = await call<{ user: string | null; csrf: string }>('auth.php');
  csrf = data.csrf;
  return data.user;
}

export async function login(username: string, password: string): Promise<string> {
  const data = await call<{ user: string; csrf: string }>('auth.php', { method: 'POST', body: JSON.stringify({ action: 'login', username, password }) });
  csrf = data.csrf;
  return data.user;
}

export async function logout(): Promise<void> {
  const data = await call<{ csrf: string }>('auth.php', { method: 'POST', body: JSON.stringify({ action: 'logout' }) });
  csrf = data.csrf;
}

export const changePassword = (current: string, next: string) =>
  call('auth.php', { method: 'POST', body: JSON.stringify({ action: 'password', current, next }) });

export const listItems = (collection: string) =>
  call<{ items: Item[] }>(`items.php?collection=${collection}`).then(data => data.items);

export const saveItem = (collection: string, item: Item, originalId: string | null) =>
  call<{ item: Item; items: Item[] }>(`items.php?collection=${collection}`, { method: 'POST', body: JSON.stringify({ item, originalId }) });

export const deleteItem = (collection: string, id: string) =>
  call<{ items: Item[] }>(`items.php?collection=${collection}&id=${encodeURIComponent(id)}`, { method: 'DELETE' }).then(data => data.items);

export const reorderItems = (collection: string, order: string[]) =>
  call<{ items: Item[] }>(`items.php?collection=${collection}`, { method: 'POST', body: JSON.stringify({ order }) }).then(data => data.items);

export async function uploadImage(file: File): Promise<string> {
  const body = new FormData();
  body.append('file', file);
  const data = await call<{ url: string }>('upload.php', { method: 'POST', body });
  return data.url;
}

export type Overview = Partial<Record<'blog' | 'projects' | 'gallery' | 'leadership' | 'partners', Item[]>>;

/** Everything currently published, from the public content endpoint. */
export const getOverview = () => call<Overview>('content.php');
