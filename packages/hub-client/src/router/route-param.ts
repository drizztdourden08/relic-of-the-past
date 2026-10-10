/* @layer site-kit @kind logic */
import type { RouteParams } from './match-route.type';

const routeParam = (params: RouteParams, name: string): string => {
  const value = params[name];
  if (value === undefined) throw new Error(`The route has no :${name} segment`);
  return value;
};

export { routeParam };
