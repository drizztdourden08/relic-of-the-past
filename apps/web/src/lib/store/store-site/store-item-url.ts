/* @layer renderer-lib @kind logic */
import { STORE_SITE_URL } from './store-site.constants';

const storeItemUrl = (itemId: string): string => `${STORE_SITE_URL}/items/${encodeURIComponent(itemId)}`;

export { storeItemUrl };
