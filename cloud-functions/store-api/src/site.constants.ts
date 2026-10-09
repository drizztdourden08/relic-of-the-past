/* @layer store-api @kind constants */
import { STORE_RIGHTS } from '@rotp/hub-contracts';
import type { SiteConfig } from '@rotp/hub-server';
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
