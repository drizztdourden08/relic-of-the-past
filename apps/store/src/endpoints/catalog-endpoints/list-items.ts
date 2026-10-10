/* @layer store-site @kind logic */
import type { ItemsListResponse } from '@rotp/hub-contracts';
import { storeApi } from '../store-client';

const listItems = (cursor: string | null) =>
  storeApi.request<ItemsListResponse>('itemsList', { query: { cursor: cursor ?? undefined } });

export { listItems };
