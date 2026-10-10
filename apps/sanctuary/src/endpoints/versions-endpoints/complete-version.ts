/* @layer sanctuary-site @kind logic */
import { sanctuaryApi } from '../sanctuary-client';
import type { FileResponse } from '../api-responses.type';

const completeVersion = (id: string, n: number, etags: string[]) =>
  sanctuaryApi.request<FileResponse>('fileVersionsComplete', { params: { id, n }, body: { etags } });

export { completeVersion };
