/* @layer shared-hub @kind types */
import type { HUB_ROUTES } from './api-contract.constants';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type RouteDef = { method: HttpMethod; path: string };

type HubRoute = keyof typeof HUB_ROUTES;

type PathParams = Record<string, string | number>;

export type { HttpMethod, RouteDef, HubRoute, PathParams };
