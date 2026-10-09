/* @layer store-site @kind constants */
import { createViewKeys } from '@site-kit/views/create-view-keys';
import { createViewStorage } from '@site-kit/views/create-view-storage';

const STORE_VIEW_SURFACES = ['browse', 'publications', 'review'] as const;

const STORE_VIEW_KEYS = createViewKeys('store', STORE_VIEW_SURFACES);

const STORE_VIEWS = createViewStorage(STORE_VIEW_KEYS);

export { STORE_VIEW_SURFACES, STORE_VIEW_KEYS, STORE_VIEWS };
