/* @layer store-site @kind logic */
import type { VersionBeginResponse } from '@shared/store/api-types';
import type { VersionBeginBody } from '@shared/store/schemas';
import { storeApi } from '../store-client';

const beginVersion = (id: string, body: VersionBeginBody) =>
  storeApi.request<VersionBeginResponse>('versionsBegin', { params: { id }, body });

export { beginVersion };
