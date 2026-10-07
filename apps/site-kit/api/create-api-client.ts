/* @layer site-kit @kind logic */
/**
 * Typed fetch over one route table. Every call is same-origin under /api with the session
 * cookie attached. A non-2xx answer becomes an ApiError carrying the server's `{ error }`
 * message, so a page can show it as is. Each site builds one client per table it calls.
 */
import { formatPath } from '@shared/hub/api-contract';
import type { PathParams, RouteDef } from '@shared/hub/api-contract';
import { ApiError } from './api-error';

const API_BASE = '/api';

type QueryParams = Record<string, string | number | boolean | undefined>;

type RequestOptions = {
  params?: PathParams;
  query?: QueryParams;
  body?: unknown;
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

const createApiClient = <Routes extends Record<string, RouteDef>>(routes: Routes) => {
  type Name = keyof Routes & string;

  const buildUrl = (route: Name, options: RequestOptions) => {
    const { params, query } = options;
    const url = API_BASE + formatPath(routes[route].path, params);
    if (!query) return url;
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) search.set(key, String(value));
    }
    const text = search.toString();
    return text ? `${url}?${text}` : url;
  };

  const request = async <T>(route: Name, options: RequestOptions = {}): Promise<T> => {
    const { body } = options;
    const { method } = routes[route];
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
  const routeHref = (route: Name, options: RequestOptions = {}) => buildUrl(route, options);

  return { request, routeHref };
};

type ApiClient<Routes extends Record<string, RouteDef>> = ReturnType<typeof createApiClient<Routes>>;

export { createApiClient };
export type { ApiClient, RequestOptions, QueryParams };
