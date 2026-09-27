/* @layer store-site @kind logic */
/** The store's own routes (catalogue, publishing, ratings, review, home) as one typed client. */
import { STORE_ROUTES } from '@shared/store/api-contract';
import { createApiClient } from '@site-kit/api/create-api-client';

const storeApi = createApiClient(STORE_ROUTES);

export { storeApi };
