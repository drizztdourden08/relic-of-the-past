/* @layer electron-main @kind constants */
import type { SiteId } from '@shared/hub';
import { SANCTUARY_API, STORE_API } from './endpoints';
import type { HubApi } from './endpoints';

const SITE_APIS: Record<SiteId, HubApi> = { sanctuary: SANCTUARY_API, store: STORE_API };

export { SITE_APIS };
