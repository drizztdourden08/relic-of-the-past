/* @layer store-site @kind logic */
import { STORE_ROUTES } from '@rotp/hub-contracts';
import { createApiClient } from '@site-kit/api/create-api-client';

const storeApi = createApiClient(STORE_ROUTES);

export { storeApi };
