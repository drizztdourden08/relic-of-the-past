/* @layer electron-main @kind logic */
/**
 * Where the Sanctuary lives. The origin is public, same trust model as the GitHub URL in
 * updater/index.ts; the API answers under /api on that origin, through the hosting rewrite,
 * so the device token never crosses an origin.
 */
import { SANCTUARY_ROUTES, formatPath } from '@shared/sanctuary';
import type { PathParams, SanctuaryRoute } from '@shared/sanctuary';

const SANCTUARY_ORIGIN = 'https://sanctuary.relic-of-the-past.com';
const SANCTUARY_API_BASE = `${SANCTUARY_ORIGIN}/api`;

/** Full URL of one API route, with its `:name` segments filled from `params`. */
const apiUrl = (route: SanctuaryRoute, params: PathParams = {}): string =>
  `${SANCTUARY_API_BASE}${formatPath(SANCTUARY_ROUTES[route].path, params)}`;

/** The site page of one report, for the "See it in the Sanctuary" button. */
const reportPageUrl = (reportId: string): string => `${SANCTUARY_ORIGIN}/reports/${encodeURIComponent(reportId)}`;

export { SANCTUARY_ORIGIN, SANCTUARY_API_BASE, apiUrl, reportPageUrl };
