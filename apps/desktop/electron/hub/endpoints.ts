/* @layer electron-main @kind logic */
/**
 * Where the sites' APIs live. Each answers under /api on its own origin, through its
 * hosting rewrite, so the device token never crosses an origin. The origins are public,
 * same trust model as the GitHub URL in updater/index.ts. Every call names the API it goes
 * to; one device token serves them all.
 */
import { formatPath } from '@shared/hub';
import type { PathParams, RouteDef } from '@shared/hub';

type HubApi = {
  /** The site's own origin; its API is `${origin}/api`. */
  origin: string;
};

const SANCTUARY_API: HubApi = { origin: 'https://sanctuary.relic-of-the-past.com' };

/** The Hookshop. A placeholder origin until the store's domain exists. */
const STORE_API: HubApi = { origin: 'https://hookshop.relic-of-the-past.com' };

/** Query values; an empty or absent one is left out of the URL. */
type QueryParams = Record<string, string | null | undefined>;

const queryString = (query: QueryParams): string => {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value) search.set(key, value);
  }
  const text = search.toString();
  return text ? `?${text}` : '';
};

/** Full URL of one API route, with its `:name` segments filled from `params`. */
const apiUrl = (api: HubApi, route: RouteDef, params: PathParams = {}, query: QueryParams = {}): string =>
  `${api.origin}/api${formatPath(route.path, params)}${queryString(query)}`;

export { SANCTUARY_API, STORE_API, apiUrl };
export type { QueryParams };
export type { HubApi };
