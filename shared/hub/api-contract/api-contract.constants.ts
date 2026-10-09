/* @layer shared-hub @kind constants */
import type { RouteDef } from './api-contract.type';
import { route } from './route';

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

export { HUB_ROUTES };
