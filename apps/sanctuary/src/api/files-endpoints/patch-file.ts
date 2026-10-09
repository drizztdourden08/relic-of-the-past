/* @layer sanctuary-site @kind logic */
import type { PatchFileBody } from '@rotp/hub-contracts';
import { sanctuaryApi } from '../sanctuary-client';
import type { FileResponse } from '../api-responses.type';

const patchFile = (id: string, patch: PatchFileBody) =>
  sanctuaryApi.request<FileResponse>('filesPatch', { params: { id }, body: patch });

export { patchFile };
