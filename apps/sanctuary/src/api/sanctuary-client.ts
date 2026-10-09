/* @layer sanctuary-site @kind logic */
import { SANCTUARY_ROUTES } from '@rotp/hub-contracts';
import { createApiClient } from '@site-kit/api/create-api-client';

const sanctuaryApi = createApiClient(SANCTUARY_ROUTES);

export { sanctuaryApi };
