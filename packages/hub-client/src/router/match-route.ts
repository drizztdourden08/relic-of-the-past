/* @layer site-kit @kind logic */
import type { RouteParams } from './match-route.type';

const splitPath = (path: string) => path.split('/').filter(Boolean);

const matchRoute = (pattern: string, path: string): RouteParams | null => {
  const want = splitPath(pattern);
  const have = splitPath(path);
  if (want.length !== have.length) return null;
  const params: RouteParams = {};
  for (const [i, segment] of want.entries()) {
    const actual = have[i];
    if (actual === undefined) return null;
    if (segment.startsWith(':')) {
      params[segment.slice(1)] = decodeURIComponent(actual);
    } else if (segment !== actual) {
      return null;
    }
  }
  return params;
};

export { matchRoute };
export type { RouteParams } from './match-route.type';
