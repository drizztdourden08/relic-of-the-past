/* @layer store-api @kind logic */
import type { HomeSettings } from '../../../../shared/store/home-types';
import { storeCollection } from './collections';
import { FEATURED_DOC, HOME_DOC } from './settings-repo.constants';
import type { FeaturedSettings } from './settings-repo.type';

const settings = () => storeCollection('settings');

const getHome = async (): Promise<HomeSettings | null> => {
  const snap = await settings().doc(HOME_DOC).get();
  return snap.exists ? (snap.data() as HomeSettings) : null;
};

const setHome = async (home: HomeSettings): Promise<void> => {
  await settings().doc(HOME_DOC).set(home);
};

const getFeatured = async (): Promise<string[]> => {
  const snap = await settings().doc(FEATURED_DOC).get();
  return snap.exists ? (snap.data() as FeaturedSettings).itemIds : [];
};

const setFeatured = async (featured: FeaturedSettings): Promise<void> => {
  await settings().doc(FEATURED_DOC).set(featured);
};

const settingsRepo = { getHome, setHome, getFeatured, setFeatured };

export { settingsRepo };
