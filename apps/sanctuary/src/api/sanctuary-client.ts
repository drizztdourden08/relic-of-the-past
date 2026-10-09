/* @layer sanctuary-site @kind logic */
import { SANCTUARY_ROUTES } from '@shared/sanctuary/api-contract';
import { createApiClient } from '@site-kit/api/create-api-client';

const sanctuaryApi = createApiClient(SANCTUARY_ROUTES);

export { sanctuaryApi };
