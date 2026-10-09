/* @layer site-kit @kind types */
import type { Identity, SavedView } from '@rotp/hub-contracts';
import type { SiteAccess, SiteUser } from '@rotp/hub-contracts';
import type { Device } from '@rotp/hub-contracts';
import type { DiscordRole, Group, Rights } from '@rotp/hub-contracts';

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
