/* @layer store-site @kind logic */
import type { UploadedPartsResponse } from '@shared/store/api-types';
import { storeApi } from '../store-client';

const versionParts = (id: string, n: number) =>
  storeApi.request<UploadedPartsResponse>('versionsParts', { params: { id, n } });

export { versionParts };
