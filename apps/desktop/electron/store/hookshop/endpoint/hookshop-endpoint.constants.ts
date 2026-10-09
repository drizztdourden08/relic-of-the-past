/* @layer electron-main @kind constants */
import type { CatalogEndpoint } from '@drizztdourden08/brock-catalog/main';
import { STORE_API } from '../../../hub/endpoints';
import { clearToken } from '../../../hub/token-store';
import { authHeaders } from './auth-headers';
import { hubFetch } from './hub-fetch';

const HOOKSHOP_ENDPOINT: CatalogEndpoint = {
  baseUrl: `${STORE_API.origin}/api`,
  headers: authHeaders,
  fetch: hubFetch,
  onUnauthorized: () => clearToken(),
};

export { HOOKSHOP_ENDPOINT };
