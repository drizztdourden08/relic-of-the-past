/* @layer store-api @kind constants */
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
