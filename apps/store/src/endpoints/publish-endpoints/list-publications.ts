/* @layer store-site @kind logic */
import type { PublicationsResponse } from '@rotp/hub-contracts';
import { storeApi } from '../store-client';

const listPublications = () => storeApi.request<PublicationsResponse>('myPublications');

export { listPublications };
