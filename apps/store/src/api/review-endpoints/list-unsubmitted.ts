/* @layer store-site @kind logic */
import type { UnsubmittedResponse } from '@shared/store/api-types';
import { storeApi } from '../store-client';

const listUnsubmitted = () => storeApi.request<UnsubmittedResponse>('reviewUnsubmitted');

export { listUnsubmitted };
