/* @layer sanctuary-site @kind logic */
import { sanctuaryApi } from '../sanctuary-client';
import type { FileResponse } from '../api-responses.type';

const restoreVersion = (id: string, n: number) =>
  sanctuaryApi.request<FileResponse>('fileVersionsRestore', { params: { id, n }, body: {} });

export { restoreVersion };
