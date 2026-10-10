/* @layer store-site @kind logic */
import type { UnsubmittedResponse } from '@rotp/hub-contracts';
import { storeApi } from '../store-client';

const listUnsubmitted = () => storeApi.request<UnsubmittedResponse>('reviewUnsubmitted');

export { listUnsubmitted };
