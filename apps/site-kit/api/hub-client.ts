/* @layer site-kit @kind logic */
/** The account routes every site serves, as one typed client. */
import { HUB_ROUTES } from '@shared/hub/api-contract';
import { createApiClient } from './create-api-client';

const hubApi = createApiClient(HUB_ROUTES);

export { hubApi };
