/* @layer sanctuary-site @kind logic */
import { sanctuaryApi } from '../sanctuary-client';
import type { FileResponse } from '../api-responses.type';

const deleteVersion = (id: string, n: number) => sanctuaryApi.request<FileResponse>('fileVersionsDelete', { params: { id, n } });

export { deleteVersion };
