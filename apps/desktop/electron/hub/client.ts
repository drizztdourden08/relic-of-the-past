/* @layer electron-main @kind logic */
/**
 * One JSON call to a site's API. The device token rides as a Bearer header when one is
 * given; a non-2xx answer becomes an error carrying the status and the API's own message, so
 * the callers can tell a revoked token (401) from a network failure.
 */
import type { PathParams, RouteDef } from '@shared/hub';
import { apiUrl } from './endpoints';
import type { HubApi, QueryParams } from './endpoints';

type HubApiError = Error & { status: number };

interface ApiCall {
  route: RouteDef;
  params?: PathParams;
  query?: QueryParams;
  body?: unknown;
  token?: string | null;
}

const apiError = (status: number, message: string): HubApiError =>
  Object.assign(new Error(message), { name: 'HubApiError', status });

const isApiError = (err: unknown): err is HubApiError =>
  err instanceof Error && typeof (err as { status?: unknown }).status === 'number';

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

export { callApi, isApiError };
export type { ApiCall, HubApiError };
