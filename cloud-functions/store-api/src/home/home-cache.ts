/* @layer store-api @kind logic */
/** The built home page, held in memory for STORE_LIMITS.homeCacheMs so a burst of visits
 *  costs one build. A change on this instance (a decision, the featured row, the welcome)
 *  drops the copy at once; other instances catch up within the window. The signed picture
 *  links outlive the window. */
import type { HomeView } from '../../../../shared/store/home-types';
import { STORE_LIMITS } from '../../../../shared/store/limits';
import { now } from '../../../hub-core/db/firestore';
import { buildHome } from './build-home';

let cache: { view: HomeView; at: number } | null = null;

const cachedHome = async (): Promise<HomeView> => {
  if (cache && now() - cache.at < STORE_LIMITS.homeCacheMs) return cache.view;
  const view = await buildHome();
  cache = { view, at: now() };
  return view;
};

const invalidateHome = (): void => {
  cache = null;
};

export { cachedHome, invalidateHome };
