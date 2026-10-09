/* @layer store-site @kind logic */
import type { PublicationsResponse } from '@shared/store/api-types';
import { storeApi } from '../store-client';

const listPublications = () => storeApi.request<PublicationsResponse>('myPublications');

export { listPublications };
