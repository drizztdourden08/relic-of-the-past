/* @layer sanctuary-site @kind logic */
import { sanctuaryApi } from '../sanctuary-client';
import type { UploadedPartsResponse } from '../api-responses.type';

const fileParts = (id: string) => sanctuaryApi.request<UploadedPartsResponse>('filesParts', { params: { id } });

export { fileParts };
