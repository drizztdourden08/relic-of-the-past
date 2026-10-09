/* @layer sanctuary-site @kind logic */
import { sanctuaryApi } from '../sanctuary-client';
import type { FileResponse } from '../api-responses.type';

const completeFile = (id: string, etags: string[]) =>
  sanctuaryApi.request<FileResponse>('filesComplete', { params: { id }, body: { etags } });

export { completeFile };
