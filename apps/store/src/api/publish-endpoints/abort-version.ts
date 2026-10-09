/* @layer store-site @kind logic */
import type { ItemChangeResponse } from '@shared/store/api-types';
import { storeApi } from '../store-client';

const abortVersion = (id: string, n: number) =>
  storeApi.request<ItemChangeResponse>('versionsAbort', { params: { id, n }, body: {} });

export { abortVersion };
