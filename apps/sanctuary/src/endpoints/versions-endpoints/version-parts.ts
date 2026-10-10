/* @layer sanctuary-site @kind logic */
import { sanctuaryApi } from '../sanctuary-client';
import type { UploadedPartsResponse } from '../api-responses.type';

const versionParts = (id: string, n: number) =>
  sanctuaryApi.request<UploadedPartsResponse>('fileVersionsParts', { params: { id, n } });

export { versionParts };
