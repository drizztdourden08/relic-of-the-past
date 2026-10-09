/* @layer hub-core @kind logic */
import type { Route } from '../route.type';
import { matchPath } from './match-path';
import type { RouteMatch } from './router.type';

const findRoute = (routes: Route[], method: string, path: string): RouteMatch => {
  let pathMatched = false;
  for (const route of routes) {
    const params = matchPath(route.path, path);
    if (!params) continue;
    pathMatched = true;
    if (route.method === method) return { handler: route.handler, params };
  }
  return { status: pathMatched ? 405 : 404 };
};

export { findRoute };
