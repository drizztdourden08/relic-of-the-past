/* @layer website-site @kind constants */
import type { SiteRoute } from './site-route.type';

const LEGAL_PATHS = { privacy: '/privacy/', terms: '/terms/' } as const;

const HOME_ROUTE: SiteRoute = { kind: 'home' };

const ROUTES: Readonly<Record<string, SiteRoute>> = {
  '/': HOME_ROUTE,
  [LEGAL_PATHS.privacy]: { kind: 'legal', doc: 'privacy' },
  [LEGAL_PATHS.terms]: { kind: 'legal', doc: 'terms' },
};

export { HOME_ROUTE, LEGAL_PATHS, ROUTES };
