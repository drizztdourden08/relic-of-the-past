/* @layer sanctuary-site @kind component */
/**
 * The route table: a path pattern, who may see it, and what it renders. The guard
 * walks this list, so a new page is one entry here.
 */
import type { ReactNode } from 'react';
import { matchRoute } from './router/match-route';
import type { RouteParams } from './router/match-route';
import { SignIn } from './pages/SignIn/SignIn';
import { Files } from './pages/Files/Files';
import { Reports } from './pages/Reports/Reports';
import { Account } from './pages/Account/Account';
import { Admin } from './pages/Admin/Admin';
import { Device } from './pages/Device/Device';

/** public: signed-out only. member: any member or admin. admin: admins only. */
type RouteAccess = 'public' | 'member' | 'admin';

type RouteEntry = {
  pattern: string;
  access: RouteAccess;
  render: (params: RouteParams) => ReactNode;
  /** The page draws its own bare frame; the guard does not wrap it in the member frame. */
  bare?: boolean;
  /** Needs the reports right on top of the access; without it the guard sends the caller to Files. */
  needsReports?: boolean;
};

const ROUTES: RouteEntry[] = [
  { pattern: '/', access: 'member', render: () => <Files /> },
  { pattern: '/files', access: 'member', render: () => <Files /> },
  { pattern: '/files/:id', access: 'member', render: ({ id }) => <Files selectedId={id} /> },
  { pattern: '/reports', access: 'member', needsReports: true, render: () => <Reports /> },
  { pattern: '/reports/:id', access: 'member', needsReports: true, render: ({ id }) => <Reports selectedId={id} /> },
  { pattern: '/account', access: 'member', render: () => <Account /> },
  { pattern: '/admin', access: 'admin', render: () => <Admin /> },
  { pattern: '/device/:code', access: 'member', bare: true, render: ({ code }) => <Device code={code} /> },
  { pattern: '/signin', access: 'public', bare: true, render: () => <SignIn /> },
];

type ResolvedRoute = { entry: RouteEntry; params: RouteParams };

const resolveRoute = (path: string): ResolvedRoute | null => {
  for (const entry of ROUTES) {
    const params = matchRoute(entry.pattern, path);
    if (params) return { entry, params };
  }
  return null;
};

export { ROUTES, resolveRoute };
export type { RouteAccess, RouteEntry, ResolvedRoute };
