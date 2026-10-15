/* @layer shared-hub @kind types */

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type RouteDef = { method: HttpMethod; path: string };

type PathParams = Record<string, string | number>;

export type { HttpMethod, RouteDef, PathParams };
