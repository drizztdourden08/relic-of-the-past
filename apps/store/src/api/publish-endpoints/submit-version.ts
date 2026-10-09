/* @layer store-site @kind logic */
import type { ItemChangeResponse } from '@shared/store/api-types';
import { storeApi } from '../store-client';

const submitVersion = (id: string, n: number) =>
  storeApi.request<ItemChangeResponse>('versionsSubmit', { params: { id, n }, body: {} });

export { submitVersion };
