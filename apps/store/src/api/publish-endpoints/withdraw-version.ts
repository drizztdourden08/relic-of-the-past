/* @layer store-site @kind logic */
import type { ItemChangeResponse } from '@rotp/hub-contracts';
import { storeApi } from '../store-client';

const withdrawVersion = (id: string, n: number) =>
  storeApi.request<ItemChangeResponse>('versionsWithdraw', { params: { id, n }, body: {} });

export { withdrawVersion };
