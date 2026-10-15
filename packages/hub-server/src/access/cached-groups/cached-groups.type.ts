/* @layer hub-core @kind types */
import type { Group } from '@rotp/hub-contracts';

type GroupCacheEntry = { groups: Group[]; at: number };

type GroupCache = { entry: GroupCacheEntry | null };

export type { GroupCache };
