/* @layer store-api @kind logic */
/** The home page settings: the welcome message and the featured order, one document each
 *  in store-settings. A fresh project reads an empty welcome and no featured items. */
import type { HomeSettings } from '../../../../shared/store/home-types';
import type { Person } from '../../../../shared/store/types';
import { storeCollection } from './collections';

type FeaturedSettings = { itemIds: string[]; updatedBy: Person; updatedAt: number };

const settings = () => storeCollection('settings');

const HOME_DOC = 'home';
const FEATURED_DOC = 'featured';

const getHome = async (): Promise<HomeSettings | null> => {
  const snap = await settings().doc(HOME_DOC).get();
  return snap.exists ? (snap.data() as HomeSettings) : null;
};

const setHome = async (home: HomeSettings): Promise<void> => {
  await settings().doc(HOME_DOC).set(home);
};

/** The featured item ids, first to last. */
const getFeatured = async (): Promise<string[]> => {
  const snap = await settings().doc(FEATURED_DOC).get();
  return snap.exists ? (snap.data() as FeaturedSettings).itemIds : [];
};

const setFeatured = async (featured: FeaturedSettings): Promise<void> => {
  await settings().doc(FEATURED_DOC).set(featured);
};

const settingsRepo = { getHome, setHome, getFeatured, setFeatured };

export { settingsRepo };
export type { FeaturedSettings };
