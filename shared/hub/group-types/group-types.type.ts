/* @layer shared-hub @kind types */
import type { SiteId } from '../site-types';

type GroupRights = Partial<Record<SiteId, string[]>>;

type Group = {
  id: string;
  name: string;
  discordRoleId: string | null;
  rights: GroupRights;
  createdAt: number;
};

type Rights = {
  site: SiteId;
  permissions: string[];
  admin: boolean;
};

type DiscordRole = {
  id: string;
  name: string;
  color: number;
  position: number;
};

export type { GroupRights, Group, Rights, DiscordRole };
