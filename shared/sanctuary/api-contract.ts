/* @layer shared-sanctuary @kind data */
/**
 * The route table shared by the site, the app and the API. A path segment starting with
 * `:` is a parameter; formatPath fills it. The API's router and the site's client both read
 * this table, so a route exists in one place.
 */
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type RouteDef = { method: HttpMethod; path: string };

const route = <M extends HttpMethod, P extends string>(method: M, path: P) => ({ method, path }) as const;

const SANCTUARY_ROUTES = {
  authStart: route('GET', '/auth/:provider/start'),
  authCallback: route('GET', '/auth/:provider/callback'),
  authSignOut: route('POST', '/auth/signout'),

  me: route('GET', '/me'),
  meRecheck: route('POST', '/me/recheck'),
  meUnlink: route('POST', '/me/unlink/:provider'),

  filesList: route('GET', '/files'),
  filesCreate: route('POST', '/files'),
  filesSignParts: route('POST', '/files/:id/parts'),
  filesComplete: route('POST', '/files/:id/complete'),
  filesDownload: route('POST', '/files/:id/download'),
  filesPatch: route('PATCH', '/files/:id'),
  filesDelete: route('DELETE', '/files/:id'),

  viewsList: route('GET', '/me/views'),
  viewsPut: route('PUT', '/me/views/:id'),
  viewsDelete: route('DELETE', '/me/views/:id'),

  adminPending: route('GET', '/admin/pending'),
  adminGrant: route('POST', '/admin/grant/:userId'),
  adminRevoke: route('POST', '/admin/revoke/:userId'),
  adminSweep: route('POST', '/admin/sweep'),

  deviceBegin: route('POST', '/device/begin'),
  deviceConfirm: route('POST', '/device/confirm'),
  devicePoll: route('POST', '/device/poll'),
  devicesList: route('GET', '/devices'),
  devicesRevoke: route('POST', '/devices/:id/revoke'),

  reportsCreate: route('POST', '/reports'),
  reportsComplete: route('POST', '/reports/:id/complete'),
  reportsList: route('GET', '/reports'),
  reportsGet: route('GET', '/reports/:id'),
  reportsDownload: route('POST', '/reports/:id/download'),
  reportsExtend: route('POST', '/reports/:id/extend'),
  reportsDelete: route('DELETE', '/reports/:id'),
} as const satisfies Record<string, RouteDef>;

type SanctuaryRoute = keyof typeof SANCTUARY_ROUTES;

type PathParams = Record<string, string | number>;

/**
 * Fills the `:name` segments of a route path from `params`, URL-encoding each value.
 * Throws when a segment has no value, so a missing id fails before the request leaves.
 */
const formatPath = (path: string, params: PathParams = {}): string =>
  path.replace(/:([A-Za-z0-9_]+)/g, (_match, name: string) => {
    const value = params[name];
    if (value === undefined) throw new Error(`formatPath: missing param "${name}" for ${path}`);
    return encodeURIComponent(String(value));
  });

export { SANCTUARY_ROUTES, formatPath };
export type { HttpMethod, RouteDef, SanctuaryRoute, PathParams };
