/* @layer shared-hub @kind data */
/**
 * The account routes every site serves, and the helpers each site's own route table is
 * built with. A path segment starting with `:` is a parameter; formatPath fills it. The
 * API's router and the site's client both read these tables, so a route exists in one place.
 */
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type RouteDef = { method: HttpMethod; path: string };

const route = <M extends HttpMethod, P extends string>(method: M, path: P) => ({ method, path }) as const;

const HUB_ROUTES = {
  authStart: route('GET', '/auth/:provider/start'),
  authCallback: route('GET', '/auth/:provider/callback'),
  authSignOut: route('POST', '/auth/signout'),

  me: route('GET', '/me'),
  meRecheck: route('POST', '/me/recheck'),
  meUnlink: route('POST', '/me/unlink/:provider'),

  viewsList: route('GET', '/me/views'),
  viewsPut: route('PUT', '/me/views/:id'),
  viewsDelete: route('DELETE', '/me/views/:id'),

  adminPending: route('GET', '/admin/pending'),
  adminSetGroups: route('PUT', '/admin/users/:userId/groups'),
  adminRevoke: route('POST', '/admin/revoke/:userId'),
  groupsList: route('GET', '/groups'),
  discordRoles: route('GET', '/discord/roles'),
  groupsCreate: route('POST', '/groups'),
  groupsPatch: route('PATCH', '/groups/:id'),
  groupsDelete: route('DELETE', '/groups/:id'),

  deviceBegin: route('POST', '/device/begin'),
  deviceConfirm: route('POST', '/device/confirm'),
  devicePoll: route('POST', '/device/poll'),
  devicesList: route('GET', '/devices'),
  devicesRevoke: route('POST', '/devices/:id/revoke'),
} as const satisfies Record<string, RouteDef>;

type HubRoute = keyof typeof HUB_ROUTES;

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

export { HUB_ROUTES, route, formatPath };
export type { HttpMethod, RouteDef, HubRoute, PathParams };
