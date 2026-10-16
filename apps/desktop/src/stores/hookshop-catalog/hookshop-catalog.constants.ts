/* @layer renderer-stores @kind constants */
import type { CatalogState } from './hookshop-catalog.type';

const EMPTY_CATALOG: CatalogState = { home: null, items: [], loading: false, error: null };

export { EMPTY_CATALOG };
