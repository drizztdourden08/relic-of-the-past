/* @layer store-site @kind logic */
import type { UploadedPartsResponse } from '@rotp/hub-contracts';
import { storeApi } from '../store-client';

const versionParts = (id: string, n: number) =>
  storeApi.request<UploadedPartsResponse>('versionsParts', { params: { id, n } });

export { versionParts };
