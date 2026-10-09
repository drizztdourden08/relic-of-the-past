/* @layer site-kit @kind types */
import type { DiscordRole } from '@rotp/hub-contracts';

type DiscordRolesState = {
  roles: DiscordRole[];
  available: boolean;
  loading: boolean;
  byId: ReadonlyMap<string, DiscordRole>;
};

export type { DiscordRolesState };
