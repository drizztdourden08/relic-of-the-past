/* @layer site-kit @kind logic */
import { matchRoute } from '@rotp/hub-client';
import type { ResolvedRoute, RouteEntry } from './route-table.type';

const resolveRoute = (routes: readonly RouteEntry[], path: string): ResolvedRoute | null => {
  for (const entry of routes) {
    const params = matchRoute(entry.pattern, path);
    if (params) return { entry, params };
  }
  return null;
};

export { resolveRoute };
export type { RouteAccess, RouteEntry, ResolvedRoute } from './route-table.type';
