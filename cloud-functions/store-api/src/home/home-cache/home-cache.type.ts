/* @layer store-api @kind types */
import type { HomeView } from '../../../../../shared/store/home-types';

type HomeCacheEntry = { view: HomeView; at: number };

type HomeCacheSlot = { entry: HomeCacheEntry | null };

export type { HomeCacheEntry, HomeCacheSlot };
