/* @layer store-api @kind types */
import type { HomeView } from '@rotp/hub-contracts';

type HomeCacheEntry = { view: HomeView; at: number };

type HomeCacheSlot = { entry: HomeCacheEntry | null };

export type { HomeCacheEntry, HomeCacheSlot };
