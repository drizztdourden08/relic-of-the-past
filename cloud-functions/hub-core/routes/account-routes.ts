/* @layer hub-core @kind logic */
/** Every account route a site serves: sign-in, me, saved views, devices, groups and the
 *  admin queue, bound to one site's config. A site's function puts these first in its
 *  table and its own routes after. No two patterns here match the same path. */
import type { SiteConfig } from '../site-config.type';
import type { Route } from '../route.type';
import { authStart } from './auth-start';
import { authCallback } from './auth-callback';
import { authSignOut } from './auth-signout';
import { me } from './me';
import { meRecheck } from './me-recheck';
import { meUnlink } from './me-unlink';
import { viewsList } from './views-list';
import { viewsPut } from './views-put';
import { viewsDelete } from './views-delete';
import { adminPending } from './admin-pending';
import { adminSetGroups } from './admin-set-groups';
import { adminRevoke } from './admin-revoke';
import { groupsList } from './groups-list';
import { discordRoles } from './discord-roles';
import { groupsCreate } from './groups-create';
import { groupsPatch } from './groups-patch';
import { groupsDelete } from './groups-delete';
import { deviceBegin } from './device-begin';
import { deviceConfirm } from './device-confirm';
import { devicePoll } from './device-poll';
import { devicesList } from './devices-list';
import { devicesRevoke } from './devices-revoke';

const accountRoutes = (site: SiteConfig): Route[] => [
  authStart(site),
  authCallback(site),
  authSignOut,
  me(site),
  meRecheck(site),
  meUnlink(site),
  viewsList(site),
  viewsPut(site),
  viewsDelete,
  adminPending(site),
  adminSetGroups(site),
  groupsList(site),
  discordRoles(site),
  groupsCreate(site),
  groupsPatch(site),
  groupsDelete(site),
  adminRevoke(site),
  deviceBegin(site),
  deviceConfirm,
  devicePoll,
  devicesList,
  devicesRevoke,
];

export { accountRoutes };
