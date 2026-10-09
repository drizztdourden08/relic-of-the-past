/* @layer store-site @kind logic */
import type { MediaUploadResponse } from '@shared/store/api-types';
import type { MediaUploadBody } from '@shared/store/schemas';
import { storeApi } from '../store-client';

const beginMedia = (id: string, body: MediaUploadBody) =>
  storeApi.request<MediaUploadResponse>('itemsMedia', { params: { id }, body });

export { beginMedia };
