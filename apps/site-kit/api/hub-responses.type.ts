/* @layer site-kit @kind types */
import type { Identity, SavedView } from '@shared/hub/types';
import type { SiteAccess, SiteUser } from '@shared/hub/site-types';
import type { Device } from '@shared/hub/device-types';
import type { DiscordRole, Group, Rights } from '@shared/hub/group-types';

type MeResponse = {
  user: SiteUser;
  identities: Identity[];
  groups: Group[];
  rights: Rights;
  via: 'session' | 'device';
  deviceId: string | null;
};

type GroupView = Group & {
  memberCount: number;
  manualCount: number;
};

type GroupsListResponse = { groups: GroupView[] };

type GroupResponse = { group: Group };

type DiscordRolesResponse = { roles: DiscordRole[]; available: boolean };

type UserResponse = { user: SiteUser };

type RecheckResponse = { access: SiteAccess | null };

type DevicesResponse = { devices: Device[] };

type DeviceConfirmResponse = { device: Pick<Device, 'id' | 'label' | 'platform'> };

type AdminUser = { user: SiteUser; identities: Identity[] };

type AdminQueueResponse = { users: AdminUser[] };

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
