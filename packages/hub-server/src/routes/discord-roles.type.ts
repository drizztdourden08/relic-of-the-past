/* @layer hub-core @kind types */
import type { DiscordRole } from '@rotp/hub-contracts';

type RawRole = { id: string; name: string; color: number; position: number; managed: boolean };

type CachedRoles = { at: number; roles: DiscordRole[] };

export type { RawRole, CachedRoles };
