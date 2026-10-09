/* @layer store-site @kind logic */
import type { VersionCompleteResponse } from '@rotp/hub-contracts';
import { storeApi } from '../store-client';

const completeVersion = (id: string, n: number, etags: string[]) =>
  storeApi.request<VersionCompleteResponse>('versionsComplete', { params: { id, n }, body: { etags } });

export { completeVersion };
