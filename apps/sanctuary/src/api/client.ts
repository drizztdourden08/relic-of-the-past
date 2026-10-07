/* @layer sanctuary-site @kind logic */
/**
 * Typed fetch over the shared route table. Every call is same-origin under /api with the
 * session cookie attached. A non-2xx answer becomes an ApiError carrying the server's
 * `{ error }` message, so a page can show it as is.
 */
import { SANCTUARY_ROUTES, formatPath } from '@shared/sanctuary/api-contract';
import type { PathParams, SanctuaryRoute } from '@shared/sanctuary/api-contract';

const API_BASE = '/api';

type QueryParams = Record<string, string | number | boolean | undefined>;

type RequestOptions = {
  params?: PathParams;
  query?: QueryParams;
  body?: unknown;
};

class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const buildUrl = (route: SanctuaryRoute, options: RequestOptions) => {
  const { params, query } = options;
  const url = API_BASE + formatPath(SANCTUARY_ROUTES[route].path, params);
  if (!query) return url;
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) search.set(key, String(value));
  }
  const text = search.toString();
  return text ? `${url}?${text}` : url;
};

const readError = async (response: Response) => {
  try {
    const data = (await response.json()) as { error?: unknown };
    if (typeof data.error === 'string' && data.error) return data.error;
  } catch {
    // Not JSON; fall through to the status text.
  }
  return response.statusText || `Request failed (${response.status})`;
};

const request = async <T>(route: SanctuaryRoute, options: RequestOptions = {}): Promise<T> => {
  const { body } = options;
  const { method } = SANCTUARY_ROUTES[route];
  const response = await fetch(buildUrl(route, options), {
    method,
    credentials: 'include',
    headers: body === undefined ? undefined : { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) throw new ApiError(response.status, await readError(response));
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
};

/** The absolute URL of a GET route the browser must visit itself (OAuth start). */
const routeHref = (route: SanctuaryRoute, options: RequestOptions = {}) => buildUrl(route, options);

const errorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error));

export { request, routeHref, errorMessage, ApiError };
export type { RequestOptions, QueryParams };
