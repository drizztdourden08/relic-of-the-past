/* @layer website-site @kind logic */
import { HOME_ROUTE, ROUTES } from './routes.constants';
import type { SiteRoute } from './site-route.type';

const withSlash = (path: string): string => (path.endsWith('/') ? path : `${path}/`);

const routeOf = (pathname: string): SiteRoute => ROUTES[withSlash(pathname)] ?? HOME_ROUTE;

export { routeOf };
