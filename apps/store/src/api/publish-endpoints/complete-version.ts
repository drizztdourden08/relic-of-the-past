/* @layer store-site @kind logic */
import type { VersionCompleteResponse } from '@shared/store/api-types';
import { storeApi } from '../store-client';

const completeVersion = (id: string, n: number, etags: string[]) =>
  storeApi.request<VersionCompleteResponse>('versionsComplete', { params: { id, n }, body: { etags } });

export { completeVersion };
