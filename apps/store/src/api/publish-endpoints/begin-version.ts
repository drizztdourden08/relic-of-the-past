/* @layer store-site @kind logic */
import type { VersionBeginResponse } from '@rotp/hub-contracts';
import type { VersionBeginBody } from '@rotp/hub-contracts';
import { storeApi } from '../store-client';

const beginVersion = (id: string, body: VersionBeginBody) =>
  storeApi.request<VersionBeginResponse>('versionsBegin', { params: { id }, body });

export { beginVersion };
