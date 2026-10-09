/* @layer site-kit @kind types */
import type { DiscordRole } from '@shared/hub/group-types';

type DiscordRolesState = {
  roles: DiscordRole[];
  available: boolean;
  loading: boolean;
  byId: ReadonlyMap<string, DiscordRole>;
};

export type { DiscordRolesState };
