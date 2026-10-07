/* @layer store-api @kind logic */
/** The store as hub-core sees it: an open site on its own origin, where signing in makes
 *  you a player. Its rights are the store's two permissions; it seeds no default group,
 *  since groups are managed on the Sanctuary. */
import { STORE_RIGHTS } from '../../../shared/store/store-rights';
import type { SiteConfig } from '../../hub-core/site-config.type';
import { readStoreEnv } from './env';

const STORE_VIEW_SURFACES = ['browse', 'publications', 'review'] as const;

const STORE_SITE: SiteConfig = {
  id: 'store',
  origin: () => readStoreEnv().STORE_ORIGIN,
  access: 'open',
  rights: STORE_RIGHTS,
  viewSurfaces: STORE_VIEW_SURFACES,
  defaultGroup: null,
};

export { STORE_SITE, STORE_VIEW_SURFACES };
