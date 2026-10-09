/* @layer store-site @kind logic */
import type { VersionBeginResponse, VersionBeginBody } from '@rotp/hub-contracts';
import { storeApi } from '../store-client';

const beginVersion = (id: string, body: VersionBeginBody) =>
  storeApi.request<VersionBeginResponse>('versionsBegin', { params: { id }, body });

export { beginVersion };
