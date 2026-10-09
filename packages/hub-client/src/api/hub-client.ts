/* @layer site-kit @kind logic */
import { HUB_ROUTES } from '@rotp/hub-contracts';
import { createApiClient } from './create-api-client';

const hubApi = createApiClient(HUB_ROUTES);

export { hubApi };
