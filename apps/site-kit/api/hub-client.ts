/* @layer site-kit @kind logic */
import { HUB_ROUTES } from '@shared/hub/api-contract';
import { createApiClient } from './create-api-client';

const hubApi = createApiClient(HUB_ROUTES);

export { hubApi };
