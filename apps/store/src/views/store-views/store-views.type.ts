/* @layer store-site @kind types */
import type { STORE_VIEW_SURFACES } from './store-views.constants';

type StoreViewSurface = (typeof STORE_VIEW_SURFACES)[number];

export type { StoreViewSurface };
