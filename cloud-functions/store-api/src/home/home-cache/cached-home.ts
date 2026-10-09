/* @layer store-api @kind logic */
import type { HomeView } from '@rotp/hub-contracts';
import { STORE_LIMITS } from '@rotp/hub-contracts';
import { now } from '../../../../hub-core/db/firestore';
import { buildHome } from '../build-home';
import { homeCacheSlot } from './home-cache-slot';

const cachedHome = async (): Promise<HomeView> => {
  const cache = homeCacheSlot.entry;
  if (cache && now() - cache.at < STORE_LIMITS.homeCacheMs) return cache.view;
  const view = await buildHome();
  homeCacheSlot.entry = { view, at: now() };
  return view;
};

export { cachedHome };
