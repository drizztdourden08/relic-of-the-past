/* @layer store-site @kind logic */
import type { ItemChangeResponse } from '@shared/store/api-types';
import { storeApi } from '../store-client';

const deleteVersion = (id: string, n: number) =>
  storeApi.request<ItemChangeResponse>('versionsDelete', { params: { id, n } });

export { deleteVersion };
