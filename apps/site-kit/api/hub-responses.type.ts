/* @layer site-kit @kind types */
/**
 * Response shapes of the account routes every site serves. The request bodies come from
 * shared/hub/schemas; a site's own answers live beside its own endpoints.
 */
import type { Identity, SavedView } from '@shared/hub/types';
import type { SiteAccess, SiteUser } from '@shared/hub/site-types';
import type { Device } from '@shared/hub/device-types';
import type { DiscordRole, Group, Rights } from '@shared/hub/group-types';

/** GET /me: the caller, their groups and the rights those groups add up to on this site. */
type MeResponse = {
  user: SiteUser;
  identities: Identity[];
  groups: Group[];
  rights: Rights;
  via: 'session' | 'device';
  deviceId: string | null;
};

/** One group as the admin list shows it, with how many people are in it. */
type GroupView = Group & {
  memberCount: number;
  /** Of those, the ones an admin added by hand. */
  manualCount: number;
};

/** GET /groups */
type GroupsListResponse = { groups: GroupView[] };

/** POST /groups and PATCH /groups/:id */
type GroupResponse = { group: Group };

/** GET /discord/roles; `available` is false when the API has no bot. */
type DiscordRolesResponse = { roles: DiscordRole[]; available: boolean };

/** PUT /admin/users/:userId/groups */
type UserResponse = { user: SiteUser };

/** POST /me/recheck */
type RecheckResponse = { access: SiteAccess | null };

/** GET /devices */
type DevicesResponse = { devices: Device[] };

/** POST /device/confirm */
type DeviceConfirmResponse = { device: Pick<Device, 'id' | 'label' | 'platform'> };

/** One row of the admin queue: a user with the identities that name them. */
type AdminUser = { user: SiteUser; identities: Identity[] };

/** GET /admin/pending: everyone holding a record on this site, grouped by the page. */
type AdminQueueResponse = { users: AdminUser[] };

/** GET /me/views?surface */
type ViewsListResponse = { views: SavedView[] };

export type {
  MeResponse,
  GroupView,
  GroupsListResponse,
  GroupResponse,
  DiscordRolesResponse,
  UserResponse,
  RecheckResponse,
  DevicesResponse,
  DeviceConfirmResponse,
  AdminUser,
  AdminQueueResponse,
  ViewsListResponse,
};
