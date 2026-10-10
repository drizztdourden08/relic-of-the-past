/* @layer sanctuary-site @kind logic */
import { SANCTUARY_ROUTES } from '@rotp/hub-contracts';
import { createApiClient } from '@rotp/hub-client';

const sanctuaryApi = createApiClient(SANCTUARY_ROUTES);

export { sanctuaryApi };
