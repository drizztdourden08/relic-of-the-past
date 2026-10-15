/* @layer site-kit @kind logic */
import { formatPath } from '@rotp/hub-contracts';
import type { RouteDef } from '@rotp/hub-contracts';
import { ApiError } from './api-error';
import { API_BASE } from './create-api-client.constants';
import type { RequestOptions, RouteName } from './create-api-client.type';

const readError = async (response: Response) => {
  const data = (await response.json().catch(() => null)) as { error?: unknown } | null;
  if (typeof data?.error === 'string' && data.error) return data.error;
  return response.statusText || `Request failed (${response.status})`;
};

const createApiClient = <Routes extends Record<string, RouteDef>>(routes: Routes) => {
  const routeDef = (route: RouteName<Routes>): RouteDef => {
    const def = routes[route];
    if (def === undefined) throw new Error(`Unknown API route: ${route}`);
    return def;
  };

  const buildUrl = (route: RouteName<Routes>, options: RequestOptions) => {
    const { params, query } = options;
    const url = API_BASE + formatPath(routeDef(route).path, params);
    if (!query) return url;
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) search.set(key, String(value));
    }
    const text = search.toString();
    return text ? `${url}?${text}` : url;
  };

  const request = async <T>(route: RouteName<Routes>, options: RequestOptions = {}): Promise<T> => {
    const { body } = options;
    const { method } = routeDef(route);
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

  const routeHref = (route: RouteName<Routes>, options: RequestOptions = {}) => buildUrl(route, options);

  return { request, routeHref };
};

export { createApiClient };
