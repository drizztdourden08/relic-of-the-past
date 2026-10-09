/* @layer site-kit @kind logic */
import type { RouteParams } from './match-route.type';

const splitPath = (path: string) => path.split('/').filter(Boolean);

const matchRoute = (pattern: string, path: string): RouteParams | null => {
  const want = splitPath(pattern);
  const have = splitPath(path);
  if (want.length !== have.length) return null;
  const params: RouteParams = {};
  for (let i = 0; i < want.length; i += 1) {
    const segment = want[i];
    if (segment.startsWith(':')) {
      params[segment.slice(1)] = decodeURIComponent(have[i]);
    } else if (segment !== have[i]) {
      return null;
    }
  }
  return params;
};

export { matchRoute };
export type { RouteParams } from './match-route.type';
