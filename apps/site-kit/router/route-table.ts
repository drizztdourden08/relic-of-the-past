/* @layer site-kit @kind logic */
/**
 * A site's route table: a path pattern, who may see it, and what it renders. The guard
 * walks the list, so a new page is one entry in the site's table.
 */
import type { ReactNode } from 'react';
import { matchRoute } from './match-route';
import type { RouteParams } from './match-route';

/** public: signed-out only. member: any member or admin. admin: admins only. */
type RouteAccess = 'public' | 'member' | 'admin';

type RouteEntry = {
  pattern: string;
  access: RouteAccess;
  render: (params: RouteParams) => ReactNode;
  /** The page draws its own bare frame; the guard does not wrap it in the member frame. */
  bare?: boolean;
  /** Needs this permission on top of the access; without it the guard sends the caller home. */
  permission?: string;
};

type ResolvedRoute = { entry: RouteEntry; params: RouteParams };

const resolveRoute = (routes: readonly RouteEntry[], path: string): ResolvedRoute | null => {
  for (const entry of routes) {
    const params = matchRoute(entry.pattern, path);
    if (params) return { entry, params };
  }
  return null;
};

export { resolveRoute };
export type { RouteAccess, RouteEntry, ResolvedRoute };
