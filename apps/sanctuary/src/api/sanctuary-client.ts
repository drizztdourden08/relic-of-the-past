/* @layer sanctuary-site @kind logic */
/** The Sanctuary's own routes (files, versions, reports) as one typed client. */
import { SANCTUARY_ROUTES } from '@shared/sanctuary/api-contract';
import { createApiClient } from '@site-kit/api/create-api-client';

const sanctuaryApi = createApiClient(SANCTUARY_ROUTES);

export { sanctuaryApi };
