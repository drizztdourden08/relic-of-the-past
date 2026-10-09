/* @layer electron-main @kind logic */
import { apiUrl } from '../endpoints';
import type { HubApi } from '../endpoints';
import { apiError } from './api-error';
import type { ApiCall } from './client.type';

const messageOf = async (res: Response): Promise<string> => {
  const parsed = await res.json().catch(() => null) as { error?: string; message?: string } | null;
  return parsed?.error ?? parsed?.message ?? `request failed (${res.status})`;
};

const callApi = async <T>(api: HubApi, call: ApiCall): Promise<T> => {
  const { route, params, query, body, token } = call;
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(apiUrl(api, route, params, query), {
    method: route.method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) throw apiError(res.status, await messageOf(res));
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
};

export { callApi };
