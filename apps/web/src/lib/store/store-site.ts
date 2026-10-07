/* @layer renderer-lib @kind logic */
/**
 * The Hookshop site, opened in the system browser for everything the app does not do:
 * publishing, ratings, profiles. A placeholder origin until the store's domain exists; the
 * main process names the same origin for the store API (electron/hub/endpoints.ts).
 */
import type { MediaRef } from '@shared/store/types';

const STORE_SITE_URL = 'https://hookshop.relic-of-the-past.com';
const STORE_SITE_HOST = 'hookshop.relic-of-the-past.com';

const storeItemUrl = (itemId: string): string => `${STORE_SITE_URL}/items/${encodeURIComponent(itemId)}`;

/**
 * The bucket is private, so store-api signs every picture it answers with and puts the link
 * in `url` (valid two hours). Without one the tab draws the kind's icon instead.
 */
const storeMediaUrl = (ref: MediaRef | null): string | null => ref?.url ?? null;

export { STORE_SITE_URL, STORE_SITE_HOST, storeItemUrl, storeMediaUrl };
