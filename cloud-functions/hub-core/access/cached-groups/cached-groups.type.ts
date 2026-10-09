/* @layer hub-core @kind types */
import type { Group } from '../../../../shared/hub';

type GroupCacheEntry = { groups: Group[]; at: number };

type GroupCache = { entry: GroupCacheEntry | null };

export type { GroupCacheEntry, GroupCache };
