/* @layer store-site @kind logic */
/**
 * The store's saved views: keys `store:<surface>` over its three list surfaces. store-api
 * checks the surface name against the same list.
 */
import { createViewKeys } from '@site-kit/views/create-view-keys';
import { createViewStorage } from '@site-kit/views/create-view-storage';

const STORE_VIEW_SURFACES = ['browse', 'publications', 'review'] as const;

type StoreViewSurface = (typeof STORE_VIEW_SURFACES)[number];

const STORE_VIEW_KEYS = createViewKeys('store', STORE_VIEW_SURFACES);

const STORE_VIEWS = createViewStorage(STORE_VIEW_KEYS);

export { STORE_VIEW_SURFACES, STORE_VIEW_KEYS, STORE_VIEWS };
export type { StoreViewSurface };
