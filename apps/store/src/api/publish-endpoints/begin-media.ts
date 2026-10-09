/* @layer store-site @kind logic */
import type { MediaUploadResponse } from '@rotp/hub-contracts';
import type { MediaUploadBody } from '@rotp/hub-contracts';
import { storeApi } from '../store-client';

const beginMedia = (id: string, body: MediaUploadBody) =>
  storeApi.request<MediaUploadResponse>('itemsMedia', { params: { id }, body });

export { beginMedia };
